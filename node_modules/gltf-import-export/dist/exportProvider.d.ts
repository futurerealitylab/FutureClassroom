/**
 * Provide a file extension from a mimeType.
 *
 * @param mimeType
 */
export declare function guessFileExtension(mimeType: string): string;
/**
 * Provide a mimeType from a filename using the file extension.
 *
 * @param filename
 */
export declare function guessMimeType(filename: string): string;
/**
 * Provide a file extension from a mimeType.
 *
 * @param glTF result of JSON.parse of the glTF file contents
 * @param bufferIndex index into the buffers array
 * @param basePath path name in which the buffer file will be present.
 */
export declare function getBuffer(glTF: any, bufferIndex: number, basePath: string, binBuffer?: Buffer | null): Buffer | null;
/**
 * Round the input number up to the next multiple of 4.
 *
 * @param value number to round
 */
export declare function alignedLength(value: number): number;
/**
 * Convert glTF -> GLB; overwrites any existing file.
 *
 * @param sourceFilename input glTF filename
 * @param outputFilename output GLB filename
 */
export declare function ConvertGltfToGLB(sourceFilename: string, outputFilename: string): void;
/**
 * Convert glTF -> GLB; overwrites any existing file.
 *
 * This form uses previously parsed gltf data.
 *
 * @param gltf result of JSON.parse of the glTF file contents
 * @param sourceFilename input glTF filename
 * @param outputFilename output GLB filename
 */
export declare function ConvertToGLB(gltf: any, sourceFilename: string, outputFilename: string): void;
