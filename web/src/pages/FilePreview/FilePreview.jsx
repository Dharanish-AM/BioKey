/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { previewFile } from '../../services/fileOperations';
import "./FilePreview.css";
import { Ellipsis, EllipsisVertical, X } from 'lucide-react';

export default function FilePreview({ file, onClose }) {
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const [fileUri, setFileUri] = useState("");

    useEffect(() => {
        const fetchFilePreview = async () => {
            try {
                const response = await previewFile(userId, file._id, token);
                if (response) {
                    console.log(response);
                    setFileUri(response);
                }
            } catch (error) {
                console.error("Error fetching file preview:", error);
            }
        };

        if (file) {
            fetchFilePreview();
        }
    }, [file, userId, token]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className='file-preview-container' >
            <div className='file-preview-header'>
                <div className='file-preview-header-left'>
                    <X style={{ cursor: 'pointer' }} onClick={onClose} size={"1.7rem"} color='var(--text-color3)' />
                    <div className='file-preview-name'>{file.name}</div>
                </div>
                <EllipsisVertical style={{ cursor: 'pointer' }} size={"1.7rem"} color='var(--text-color3)' />
            </div>
            <div className='file-preview-content'>
                <img src={fileUri} className='file-preview-file' alt="File Preview" />
            </div>
            <div className='file-preview-footer'></div>
        </div>
    );
}
