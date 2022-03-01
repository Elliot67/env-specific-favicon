export function exportJSONFile(fileName: string, data: any): void {
  const completeFileName = `${fileName}.json`;
  const json = JSON.stringify(data);
  const file = new File([json], completeFileName, { type: 'application/json' });
  const exportUrl = URL.createObjectURL(file);

  const $anchor = document.createElement('a');
  $anchor.setAttribute('href', exportUrl);
  $anchor.setAttribute('download', completeFileName);
  $anchor.click();
  $anchor.remove();
}
