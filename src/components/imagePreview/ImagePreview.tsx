import React, { useEffect, useState } from 'react'
import { localhostBaseUrl } from '../../apiServices/baseUrl/BaseUrl'
interface imageProps {
    imgLink: string,
    className: string,
    alt: string
}
const ImagePreview: React.FC<imageProps> = (props) => {
    const [src, setSrc] = useState('')
    useEffect(() => {
        const preview = `${localhostBaseUrl}uploads/eSignatures/${props.imgLink?.split('/').pop()}`
        setSrc(preview)
    }, [props.imgLink])
    return (
        <img src={src} className={props.className} alt={props.alt} />
    )
}

export default ImagePreview