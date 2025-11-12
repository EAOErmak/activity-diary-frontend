import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const client = new QueryClient();
export const QueryProvider = ({ children }) => {
    return _jsx(QueryClientProvider, { client: client, children: children });
};
