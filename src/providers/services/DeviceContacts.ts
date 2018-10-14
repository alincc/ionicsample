import { Contacts, Contact as NativeContact } from "@ionic-native/contacts"
import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

export interface IContact {
    name: string,
    email?: string,
    phone?: string
}

@Injectable()
export class DeviceContacts {

    protected nativeContacts: NativeContact[];
    protected filteredContacts: IFilteredContacts = {};
    protected subject: Subject<NativeContact[]> = new Subject<NativeContact[]>();

    constructor(protected contactsCtrl: Contacts) {
    }

    subscribe(callback): Subscription {
        this.nativeContacts && callback(this.nativeContacts);
        return this.subject.subscribe(callback);
    }

    whenReady(): Promise<true> {
        let subscription: Subscription;
        return new Promise<true>(resolve => {
            subscription = this.subscribe(() => {
                subscription.unsubscribe();
                resolve(true);
            });
            this.allContacts();
        });
    }

    fetchContacts(): Promise<NativeContact[]> {
        return this.refreshContacts();
    }

    refreshContacts(): Promise<NativeContact[]> {
        return this.contactsCtrl.find(["*"])
            .then(contacts => this.nativeContacts = contacts)
            .then(() => this.filter())
            .then(() => this.next())
            .then(() => this.nativeContacts);
    }

    protected filter() {
        this.withEmail();
        this.withPhone();
    }

    allContacts(): Promise<NativeContact[]> {
        return this.nativeContacts ? Promise.resolve(this.nativeContacts) : this.refreshContacts();
    }

    withPhone(): Promise<IContact[]> {
        let result: IContact[] = [];

        return this.filteredContacts.withPhone ? Promise.resolve(this.filteredContacts.withPhone) : this.allContacts()
            .then(contacts => contacts.forEach(contact => contact.phoneNumbers !== null && contact.phoneNumbers.length && contact.phoneNumbers.forEach(phone => result.push({ name: contact.displayName, phone: phone.value } as IContact))))
            .then(() => this.filteredContacts.withPhone = result)
            .then(() => result);
    }

    withEmail(): Promise<IContact[]> {
        let result: IContact[] = [];

        return this.filteredContacts.withEmail ? Promise.resolve(this.filteredContacts.withEmail) : this.allContacts()
            .then(contacts => {contacts.forEach(contact => contact.emails !== null && contact.emails.length && contact.emails.forEach(email => result.push({ name: contact.name.formatted, email: email.value } as IContact)))})
            .then(() => this.filteredContacts.withEmail = result)
            .then(() => result);

    }

    crossCheck(contactsList: IContact[]): Promise<CrossCheckedContacts> {
        let result: CrossCheckedContacts = { exist: [], notExist: { phone: [], email: [] } };

        return new Promise<CrossCheckedContacts>((resolve, reject) => {
            this.contactsCtrl.find(["*"], { desiredFields: ["displayName", "phoneNumbers", "emails"] })
                .then(contacts => contacts.forEach((contact) => {
                    if ((contact.phoneNumbers && contact.phoneNumbers.length && contact.phoneNumbers.find(check => !!contactsList.find(againstContact => normalizePhone(againstContact.phone) === normalizePhone(check.value))))
                        || (contact.emails && contact.emails.length && contact.emails.find(check => !!contactsList.find(againstContact => againstContact.email === check.value)))) {
                        result.exist.push({ name: contact.displayName, email: contact.emails && contact.emails.length ? contact.emails[0].value : null, phone: contact.phoneNumbers && contact.phoneNumbers.length ? contact.phoneNumbers[0].value : null } as IContact)
                    } else {
                        contact.phoneNumbers && contact.phoneNumbers.length && contact.phoneNumbers.forEach(number => result.notExist.phone.push({ name: contact.displayName, phone: number.value, email: null } as IContact));
                        contact.emails && contact.emails.length && contact.emails.forEach(email => result.notExist.email.push({ name: contact.displayName, phone: null, email: email.value } as IContact));
                    }
                }))
                .then(() => result)
        });
    }

    protected next() {
        this.subject.next(this.nativeContacts);
    }

}

export interface CrossCheckedContacts {
    exist: IContact[];
    notExist: {
        phone: IContact[],
        email: IContact[]
    };
}

/**
 * Normalizes the phone number and returns it again.
 * Removes any non digit number from the number and removes any preceeding zero.
 * @param phone string the phone number to normalize
 * @return string the phone number after normalization
 */
export function normalizePhone(phone: string): string {
    return phone.replace(/[^0-9]/g, "").replace(/^0+/, "");
}

interface IFilteredContacts {
    [key: string]: IContact[];
    withPhone?: IContact[];
    withEmail?: IContact[];
}