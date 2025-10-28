import { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../errorBoundary/ErrorBoundary';
import Loader from '../loader/Loader';

interface Props {
    children: ReactNode;
}

const WrappedRoute = ({ children }: Props) => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Loader text="Loading..." />}>
            {children}
        </Suspense>
    </ErrorBoundary>
);

export default WrappedRoute;
