export default EpubParser;
declare class EpubParser extends Parser<BaseParseContext> {
    /**
     * Get default values of parse options
     */
    static get parseDefaultOptions(): {
        validatePackage: boolean;
        allowNcxFileMissing: boolean;
        parseStyle: boolean;
        styleNamespacePrefix: string;
        additionalInlineStyle: any;
        unzipPath: string;
        overwrite: boolean;
    };
    /**
     * Get types of parse options
     */
    static get parseOptionTypes(): {
        validatePackage: string;
        allowNcxFileMissing: string;
        parseStyle: string;
        styleNamespacePrefix: string;
        additionalInlineStyle: string;
        unzipPath: string;
        overwrite: string;
    };
    /**
      * @typedef {Object} EpubReadOptionExtra
      * @property {string} basePath
      * @property {boolean} extractBody
      * @property {boolean} serializedAnchor
      * @property {boolean} ignoreScript
      * @property {string[]} removeAtrules
      * @property {string[]} removeTagSelector
      * @property {string[]} removeIdSelector
      * @property {string[]} removeClassSelector
      *
      * @typedef {import('@ridi/parser-core/type/BaseReadContext').BaseReadOption & EpubReadOptionExtra} EpubReadOption
      */
    /**
     * Get default values of read options
     * @returns {EpubReadOption}
     */
    static get readDefaultOptions(): import("@ridi/parser-core/type/BaseReadContext").BaseReadOption & {
        basePath: string;
        extractBody: boolean;
        serializedAnchor: boolean;
        ignoreScript: boolean;
        removeAtrules: string[];
        removeTagSelector: string[];
        removeIdSelector: string[];
        removeClassSelector: string[];
    };
    /**
     * @typedef {Object} EpubParserOptionTypeExtra
     * @property {string} basePath
     * @property {string} extractBody
     * @property {string} serializedAnchor
     * @property {string} ignoreScript
     * @property {string} removeAtrules
     * @property {string} removeTagSelector
     * @property {string} removeIdSelector
     * @property {string} removeClassSelector
     *
     * @typedef {import('@ridi/parser-core/type/BaseReadContext').BaseReadOptionType &
     *  EpubParserOptionTypeExtra} EpubParserOptionType
     */
    /**
     * Get types of read option
     * @returns {EpubParserOptionType}
     */
    static get readOptionTypes(): import("@ridi/parser-core/type/BaseReadContext").BaseReadOptionType & {
        basePath: string;
        extractBody: string;
        serializedAnchor: string;
        ignoreScript: string;
        removeAtrules: string;
        removeTagSelector: string;
        removeIdSelector: string;
        removeClassSelector: string;
    };
    /**
     * Create new EpubParser
     * @param {string} input file or directory
     * @param {import('@ridi/parser-core/type/CryptoProvider').default} [cryptoProvider] en/decrypto provider
     * @param {string} [logLevel] logging level
     * @throws {Errors.ENOENT} no such file or directory
     * @throws {Errors.EINVAL} invalid input
     * @example new EpubParser('./foo/bar.epub' or './foo/bar');
     */
    constructor(input: string, cryptoProvider?: import('@ridi/parser-core/type/CryptoProvider').default, logLevel?: string);
    /**
     * Validate package spec if zip source and validatePackage option specified
     * @param {EpubParseContext} context intermediate result
     * @returns {Promise.<EpubParseContext>} return Context (no change at this step)
     * @throws {Errors.EINVAL} invalid package
     * @see EpubParser.parseDefaultOptions.validatePackage
     */
    _validatePackageIfNeeded(context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * Locate OPF and base path in container.xml
     * @param {EpubParseContext} context intermediate result
     * @return {Promise.<EpubParseContext>} return Context containing OPF and base path
     * @throws {Errors.ENOFILE} container.xml not found
     * @throws {Errors.EINVAL} invalid XML
     * @throws {Errors.ENOELMT} no such element in container.xml
     * @throws {Errors.ENOATTR} no such attribute in element
     */
    _parseMetaInf(context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * OPF parsing
     * @param {EpubParseContext} context intermediate result
     * @returns {Promise<EpubParseContext>} return Context containing OPF parsing result
     * @throws {Errors.EINVAL} invalid xml
     * @throws {Errors.ENOFILE} OPF not found
     * @throws {Errors.ENOELMT} no such element in OPF
     */
    _parseOpf(context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * Metadata parsing in OPF
     * @param {object} metadata metadata AST
     * @param {EpubParseContext} context intermediate result
     * @returns {Promise<EpubParseContext>} return Context containing metadata
     */
    _parseMetadata(metadata: object, context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * Manifest and spine parsing in OPF
     * @param {object} manifest manifest AST
     * @param {object} spine spine AST
     * @param {EpubParseContext} context intermediate result
     * @returns {Promise<EpubParseContext>} return Context containing manifest and spine
     * @see EpubParser.parseDefaultOptions.parseStyle
     * @see EpubParser.parseDefaultOptions.styleNamespacePrefix
     */
    _parseManifestAndSpine(manifest: object, spine: object, context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * @typedef {object} StyleParseResult
     * @property {string[]} styles path of styles linked to spine
     * @property {object[]} inlineStyles inline styles included in Spine
     */
    /**
     * @param {object} rawItem
     * @param {object} entry spine entry
     * @param {object} options parse options
     * @returns {StyleParseResult} returns styles and inline style from spine
     * @see EpubParser.parseDefaultOptions.styleNamespacePrefix
     * @see EpubParser.parseDefaultOptions.additionalInlineStyle
     */
    _parseSpineStyle(rawItem: object, entry: object, options: object): {
        /**
         * path of styles linked to spine
         */
        styles: string[];
        /**
         * inline styles included in Spine
         */
        inlineStyles: object[];
    };
    /**
     * Guide parsing in OPF
     * @param {object} guide guide AST
     * @param {EpubParseContext} context intermediate result
     * @returns {Promise<EpubParseContext>} return Context containing guide
     */
    _parseGuide(guide: object, context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * NCX parsing
     * @param {EpubParseContext} context intermediate result
     * @returns {Promise<EpubParseContext>} return Context containing ncx if exists
     * @throws {Errors.EINVAL} invalid XML
     * @throws {Errors.EINVAL} can not found ncx attribute OPF
     * @throws {Errors.ENOFILE} NCX not found
     * @throws {Errors.ENOELMT} no such element in NCX
     * @see EpubParser.parseDefaultOptions.allowNcxFileMissing
     */
    _parseNcx(context: EpubParseContext): Promise<EpubParseContext>;
    /**
     * @param {EpubBook} book
     */
    _checkResult(book: EpubBook): EpubBook;
    /**
     * @param {string} mediaType
     * @return {FontItem| NcxItem | SpineItem | CssItem | ImageItem | SvgItem | DeadItem} item type by media-type
     */
    getItemTypeFromMediaType(mediaType: string): FontItem | NcxItem | SpineItem | CssItem | ImageItem | SvgItem | DeadItem;
}
import { BaseParseContext, Parser } from "@ridi/parser-core";
import EpubParseContext from "./model/EpubParseContext";
import EpubBook from "./model/EpubBook";
import FontItem from "./model/FontItem";
import NcxItem from "./model/NcxItem";
import SpineItem from "./model/SpineItem";
import CssItem from "./model/CssItem";
import ImageItem from "./model/ImageItem";
import SvgItem from "./model/SvgItem";
import DeadItem from "./model/DeadItem";
