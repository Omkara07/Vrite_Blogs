import { ToolConstructable } from '@editorjs/editorjs';
// @ts-ignore
import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Code from "@editorjs/code"
import Image from "@editorjs/image"
import Table from "@editorjs/table"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
// @ts-ignore
import Marker from '@editorjs/marker'
import InlineCode from "@editorjs/inline-code"
import uploadImage from '../common/aws';

type ToolTypes = {
    [toolName: string]: ToolConstructable | {}
}

const uploadImageByUrl = async (url: any) => {
    return new Promise((resolve) => {
        resolve({
            success: 1,
            file: {
                url: url // the image URL
            }
        });
    });
}

const uploadImageByFile = async (file: any) => {
    return uploadImage({ img: file }).then((url) => {
        if (url) return {
            success: 1,
            file: {
                url,
            },
        };
    });
}

export const Tools: ToolTypes = {
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByUrl,
                uploadByFile: uploadImageByFile
            },
        },
    },
    code: Code,
    list: {
        class: List,
        inlineToolbar: true,
    },
    embed: Embed,
    marker: Marker,
    table: Table,
    header: {
        class: Header,
        inlineToolbar: true,
        config: {
            placeholder: "Type Heading...",
            levels: [1, 2, 3],
            defaultLevel: 2,
        },
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
    },
    inlineCode: InlineCode
}
