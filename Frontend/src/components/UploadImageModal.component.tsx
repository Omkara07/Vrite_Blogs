import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import PageAnimation from '../common/page-animation'
import { RxCross2 } from "react-icons/rx";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop'
import { imgRef } from '../pages/EditProfile.page';


type props = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    handleImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    updatedImg: any
    setUpdatedImg: React.Dispatch<React.SetStateAction<any>>

}
const UploadImageModal: React.FC<props> = ({ open, setOpen, handleImgChange, updatedImg, setUpdatedImg }) => {
    const [url, setUrl] = useState<string>("");
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        x: 25,
        y: 25,
        width: 50,
        height: 50
    })
    const [completedCrop, setCompletedCrop] = useState<Crop | undefined>(undefined)

    const modalImgRef = useRef<HTMLImageElement | null>(null) // Reference for the loaded image
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null) // Referenc
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget

        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 40,
                    height: 40
                },
                1,
                width,
                height,
            ),
            width,
            height
        )

        setCrop(crop)
    }
    async function generateCroppedImage(crop: Crop) {
        if (!completedCrop || !previewCanvasRef.current || !modalImgRef.current) {
            return
        }

        const canvas = previewCanvasRef.current
        const image = modalImgRef.current
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        // Set the canvas dimensions
        canvas.width = completedCrop.width * scaleX
        canvas.height = completedCrop.height * scaleY

        // Draw the cropped image on the canvas
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        )

        // Convert canvas to Blob (image file)
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })

        if (blob) {
            if (imgRef && imgRef.current) {
                imgRef.current.src = URL.createObjectURL(blob)
            }
            setOpen(false)
            setUpdatedImg(blob)
        }
    }

    useEffect(() => {
        if (updatedImg) {
            setUrl(URL.createObjectURL(updatedImg))
        }
    }, [updatedImg])
    return (
        <PageAnimation>
            <Dialog open={open} onClose={setOpen} className="relative z-40">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-700 bg-opacity-85 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />

                <div className="fixed inset-0 z-50 w-screen overflow-y-auto h-full py-10">
                    <div className="flex h-full justify-center p-4 items-center text-center sm:p-0 w-full">
                        <DialogPanel
                            transition
                            className="transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full md:mx-44 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 w-full h-full items-center justify-center overflow-y-auto"
                        >
                            {url.length ? (
                                <div className="flex justify-center flex-col items-center gap-10">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={1}
                                        minWidth={20}
                                        minHeight={20}
                                        circularCrop={true}
                                        className="flex justify-center items-center md:w-[70%] md:h-[70%] mt-10"
                                    >
                                        <img
                                            ref={modalImgRef}
                                            src={url}
                                            onLoad={onImageLoad}
                                            alt="Cropped Image"
                                            className="flex w-full h-full"
                                        />
                                    </ReactCrop>
                                    <button
                                        className="border-black rounded-xl border-[3px] px-10 py-3 hover:border-[1px] hover:text-xl duration-150"
                                        onClick={() => generateCroppedImage(completedCrop as Crop)}
                                    >
                                        Crop Image
                                    </button>
                                    <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
                                </div>
                            ) : (
                                <div className="bg-white flex justify-center px-4 pb-4 pt-5 sm:p-6 sm:pb-4 items-center mt-48">
                                    <div className="flex items-center justify-center">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left items-center flex">
                                            <label className="text-base font-semibold leading-6 text-gray-900 px-10 py-4 flex items-center border-black border-[3px] rounded-xl hover:border-[1px] hover:text-xl duration-150" htmlFor="uploadImg">
                                                Upload Image
                                            </label>
                                            <input type="file" id="uploadImg" onChange={handleImgChange} accept=".jpeg, .png, .jpg" hidden />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={() => setOpen(false)}
                                    className="absolute right-0 top-0 p-4 rounded-full"
                                >
                                    <RxCross2 />
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

        </PageAnimation>

    )
}

export default UploadImageModal
