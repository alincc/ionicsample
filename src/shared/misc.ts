export function delayExecution(callable, delayInMs): Promise<any> {
  return new Promise(resolve => setTimeout(() => resolve(callable()), delayInMs));
}

export function addOrderSuffix(num: number) {
  num = parseInt(num.toString());
  if (num % 100 > 3 && num % 100 < 21) {
    return num.toString() + "th";
  }
  switch (num % 10) {
    case 1:
      return num.toString() + "st";
    case 2:
      return num.toString() + "nd";
    case 3:
      return num.toString() + "rd";
    default:
      return num.toString() + "th";
  }
}
