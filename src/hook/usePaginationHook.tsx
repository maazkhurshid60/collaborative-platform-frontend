import { useEffect, useState } from 'react';

interface UsePaginationHookProps<T> {
    data: T[];
    recordPerPage?: number;
}

const usePaginationHook = <T,>({ data, recordPerPage = 10 }: UsePaginationHookProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / recordPerPage);

    const getCurrentRecords = () => {
        const start = (currentPage - 1) * recordPerPage;
        const end = start + recordPerPage;
        return data.slice(start, end);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        if (getCurrentRecords().length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [data, currentPage]);

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
