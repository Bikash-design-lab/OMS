const BASE_API = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8000"

export const API_ENDPOINTS = {
    // User endpoints
    USER_SIGNUP: `${BASE_API}/user/signup`,
    USER_SIGNIN: `${BASE_API}/user/signin`,
    USER_TEST: `${BASE_API}/user/test`,

    // Product endpoints
    PRODUCT_LIST: `${BASE_API}/product/list-product`,
    PRODUCT_ALL: `${BASE_API}/product/all-products`,
    PRODUCT_UPDATE: (id: string) => `${BASE_API}/product/update_details/${id}`,
    PRODUCT_DELETE: (id: string) => `${BASE_API}/product/remove_product/${id}`,
    PRODUCT_TEST: `${BASE_API}/product/test`,

    // Order endpoints
    ORDER_PLACE: (productId: string) => `${BASE_API}/order/product-placed-payment-pending/${productId}`,
    ORDER_PAYMENT_PAID: (orderId: string) => `${BASE_API}/order/product-placed-payment-paid/${orderId}`,
    ORDER_PICKED: (orderId: string) => `${BASE_API}/order/product-picked-payment-fulfilled/${orderId}`,
    ORDER_SHIPPED: (orderId: string) => `${BASE_API}/order/product-shipped-payment-fulfilled/${orderId}`,
    ORDER_CANCEL: (orderId: string, productId: string) => `${BASE_API}/order/cancel-order/${orderId}/${productId}`,
    ORDER_TEST: `${BASE_API}/order/test`,

    ORDER_ALL: `${BASE_API}/order/all-orders`, // For admin/staff to view all orders
    ORDER_USER_ORDERS: `${BASE_API}/order/my-orders`, // For customers to view their orders
    ORDER_BY_ID: (orderId: string) => `${BASE_API}/order/${orderId}`, // For viewing single order details
}
