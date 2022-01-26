/**
 * Convert GLB -> glTF; overwrites any existing files.
 *
 * @param sourceFilename input glb filename
 * @param targetFilename output glTF filename
 */
export declare function ConvertGLBtoGltf(sourceFilename: string, targetFilename: string): void;
/**
 * This form of GLB -> glTF convert function will open and validate the input filename
 * before calling the parameter function to get a filename for output. This is allows
 * a UI to query a customer for a filename when its expected that the conversion will
 * succeed.
 *
 * @param sourceFilename input glb filename
 * @param getTargetFilename async function that will return the output gltf filename
 * @returns the output filename
 */
export declare function ConvertGLBtoGltfLoadFirst(sourceFilename: string, getTargetFilename: () => Promise<string>): Promise<string>;
