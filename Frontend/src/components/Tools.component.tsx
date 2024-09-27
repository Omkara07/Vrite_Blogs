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


// import React, { useEffect, useRef, useContext } from 'react';
// import EditorJS from '@editorjs/editorjs';
// // import Header from '@editorjs/header';
// // import List from '@editorjs/list';
// // import Image from '@editorjs/image';
// // import Quote from '@editorjs/quote';
// // import Code from '@editorjs/code';
// // import Table from '@editorjs/table';
// // // @ts-ignore
// // import Embed from '@editorjs/embed';
// // // @ts-ignore
// // import Marker from '@editorjs/marker';
// // import InlineCode from '@editorjs/inline-code';
// import { BlogContext } from '../pages/Editor.page'; // Adjust the import path as needed
// import uploadImage from '../common/aws'; // Your image upload function
// import { toast } from 'sonner';

// export const Tools: { [toolName: string]: ToolConstructable | {} } = {
//     header: {
//         class: Header,
//         inlineToolbar: true,
//         config: {
//             levels: [2, 3], // Allow h2 and h3
//         },
//     },
//     list: {
//         class: List,
//         inlineToolbar: true,
//     },
//     image: {
//         class: Image,
//         config: {
//             uploader: {
//                 // Your custom upload function
//                 uploadByFile(file: any) {
//                     return uploadImage({ img: file }).then((url) => {
//                         return {
//                             success: 1,
//                             file: {
//                                 url,
//                             },
//                         };
//                     });
//                 },
//             },
//         },
//     },
//     quote: {
//         class: Quote,
//         inlineToolbar: true,
//     },
//     code: {
//         class: Code,
//     },
//     table: {
//         class: Table,
//     },
//     embed: Embed,
//     marker: Marker,
//     inlineCode: InlineCode,
// };

// // const BlogEditor = () => {
// //     const { blogCreds, setBlogCreds } = useContext(BlogContext);
// //     const editorRef = useRef(null);

// //     useEffect(() => {
// //         const editor = new EditorJS({
// //             holder: 'editorjs',
// //             tools: Tools,
// //             data: { blocks: [] }, // Initialize with empty data or load saved data
// //             onReady: () => {
// //                 editorRef.current = editor;
// //             },
// //             onChange: () => {
// //                 // Handle changes if needed
// //             },
// //         });

// //         return () => {
// //             editor.isReady
// //                 .then(() => {
// //                     editor.destroy();
// //                 })
// //                 .catch((error) => console.error('Error destroying editor', error));
// //         };
// //     }, []);

// //     const handleSave = async () => {
// //         const savedData = await editorRef.current.save();
// //         console.log(savedData);
// //         // You can save the data to your state or send it to an API
// //     };

// //     return (
// //         <div>
// //             <div id="editorjs" />
// //             <button onClick={handleSave}>Save</button>
// //         </div>
// //     );
// // };

// // export default BlogEditor;
