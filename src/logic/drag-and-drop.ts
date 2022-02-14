// The script has been modified but comes from :
// https://amendx.github.io/vue-dndrop/examples/helpers.html#applydrag

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function applyDragOnReactive<T = unknown>(reactiveArray: T[], dragResult: any): T[] {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) return reactiveArray;

  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = reactiveArray.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    reactiveArray.splice(addedIndex, 0, itemToAdd);
  }

  return reactiveArray;
}
