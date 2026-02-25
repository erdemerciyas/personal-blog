'use client';

import { useState, createContext, useContext } from 'react';
import AskQuestionModal from './AskQuestionModal';
import OrderModal from './OrderModal';

interface ProductContextType {
    openQuestionModal: () => void;
    openOrderModal: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function useProductContext() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductClientWrapper');
    }
    return context;
}

interface ProductClientWrapperProps {
    children: React.ReactNode;
    product: {
        _id: string;
        name: string;
        slug: string;
    };
}

export default function ProductClientWrapper({ children, product }: ProductClientWrapperProps) {
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const openQuestionModal = () => setIsQuestionModalOpen(true);
    const closeQuestionModal = () => setIsQuestionModalOpen(false);

    const openOrderModal = () => setIsOrderModalOpen(true);
    const closeOrderModal = () => setIsOrderModalOpen(false);

    return (
        <ProductContext.Provider value={{ openQuestionModal, openOrderModal }}>
            {children}
            <AskQuestionModal
                isOpen={isQuestionModalOpen}
                onClose={closeQuestionModal}
                productName={product.name}
                productId={product._id}
            />
            <OrderModal
                isOpen={isOrderModalOpen}
                closeModal={closeOrderModal}
                product={product}
            />
        </ProductContext.Provider>
    );
}
