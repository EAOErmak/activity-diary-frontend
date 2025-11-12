import { jsx as _jsx } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEntry } from "@/api/diaryApi";
import { DiaryEntryView } from "../../components/diary/DiaryEntryView";
export default function DiaryViewPage() {
    const { id } = useParams();
    const entryId = Number(id);
    const { data, isLoading, isError } = useQuery({
        queryKey: ["entry", entryId],
        queryFn: () => getEntry(entryId),
        enabled: !!entryId,
    });
    if (isLoading)
        return (_jsx("div", { className: "flex items-center justify-center h-40 text-gray-400", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u043F\u0438\u0441\u0438..." }));
    if (isError)
        return (_jsx("div", { className: "flex items-center justify-center h-40 text-red-400", children: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0437\u0430\u043F\u0438\u0441\u0438." }));
    if (!data)
        return (_jsx("div", { className: "flex items-center justify-center h-40 text-gray-400", children: "\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430." }));
    return (_jsx("div", { className: "max-w-3xl mx-auto mt-8", children: _jsx(DiaryEntryView, { entry: data }) }));
}
