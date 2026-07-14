import { useEffect, useState } from 'react';

interface UsePaginationHookProps<T> {
    data: T[];
    recordPerPage?: number;
    storageKey?: string;
}

const usePaginationHook = <T,>({ data, recordPerPage = 10, storageKey }: UsePaginationHookProps<T>) => {
    const [currentPage, setCurrentPage] = useState<number>(() => {
        if (storageKey) {
            const saved = sessionStorage.getItem(storageKey);
            return saved ? parseInt(saved, 10) : 1;
        }
        return 1;
    });

    const totalPages = Math.ceil((data?.length || 0) / recordPerPage);

    const getCurrentRecords = () => {
        const start = (currentPage - 1) * recordPerPage;
        const end = start + recordPerPage;
        return data?.slice(start, end);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (storageKey) {
            sessionStorage.setItem(storageKey, page.toString());
        }
    };

    useEffect(() => {
        if (getCurrentRecords()?.length === 0 && currentPage > 1) {
            setCurrentPage((prev) => {
                const newPage = prev - 1;
                if (storageKey) sessionStorage.setItem(storageKey, newPage.toString());
                return newPage;
            });
        }
    }, [data, currentPage, recordPerPage, storageKey]);

    return {
        currentPage,
        recordPerPage,
        setCurrentPage,
        totalPages,
        getCurrentRecords,
        handlePageChange,
    };
};

export default usePaginationHook;
