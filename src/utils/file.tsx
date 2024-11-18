export async function getImageType(blob: Blob | Uint8Array): Promise<string> {
  let uint8: Uint8Array;
  if (blob instanceof Blob) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    await new Promise((resolve, reject) => {
      reader.onload = resolve;
      reader.onerror = reject;
    });
    uint8 = new Uint8Array(reader.result as ArrayBuffer);
  } else {
    uint8 = blob;
  }
  let header = "";
  const arr = uint8.subarray(0, 2);
  for (let i = 0; i < arr.length; i++) {
    header += arr[i].toString(16);
  }
  console.log(header);
  // magic
  // https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
  switch (header) {
    case "8950":
      return "image/png";
    case "4749":
      return "image/gif";
    case "ffd8":
      return "image/jpeg";
    case "5249":
      return "image/webp";
    case "424d":
      return "image/bmp";
    default:
      throw new Error("Unsupported image type");
  }
}
