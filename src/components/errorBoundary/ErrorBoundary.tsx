import { useNavigate } from 'react-router-dom';
import { FallbackProps } from 'react-error-boundary';
import CrossIcon from '../icons/cross/Cross';

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    const navigate = useNavigate();

    const handleClose = () => {
        // Navigate first
        navigate(-1);
        // Wait a bit before resetting the boundary to prevent re-trigger
        setTimeout(() => {
            resetErrorBoundary();
        }, 100);
    };

    return (
        <div className="p-4 bg-red-100 text-red-800 rounded">
            <div className="flex justify-end relative">
                <CrossIcon onClick={handleClose} />
            </div>
            <h2 className="text-lg font-semibold">Something went wrong.</h2>
            <pre className="text-sm mt-2">{error.message}</pre>
        </div>
    );
}
