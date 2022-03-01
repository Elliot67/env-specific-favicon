export function getDateAsString(): string {
  const today = new Date();
  const day = `0${today.getDate()}`.slice(-2);
  const month = `0${today.getMonth() + 1}`.slice(-2);
  return `${today.getFullYear()}-${month}-${day}`;
}
