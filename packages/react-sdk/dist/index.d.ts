import React, { CSSProperties } from 'react';

interface BitBNPLButtonProps {
    merchantAddress: string;
    amount: number | string;
    itemName: string;
    itemId?: string;
    itemImage?: string;
    merchantName?: string;
    children?: React.ReactNode;
    style?: CSSProperties;
    className?: string;
    baseUrl?: string;
    onRedirect?: () => void;
    onError?: (error: Error) => void;
    disabled?: boolean;
}
declare function BitBNPLButton({ merchantAddress, amount, itemName, itemId, itemImage, merchantName, children, style, className, baseUrl, onRedirect, onError, disabled, }: BitBNPLButtonProps): React.JSX.Element;
declare function useMerchantVerification(merchantAddress: string): {
    isVerified: boolean;
    isLoading: boolean;
    error: null;
};
declare function BitBNPLProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;

export { BitBNPLButton, type BitBNPLButtonProps, BitBNPLProvider, BitBNPLButton as default, useMerchantVerification };
