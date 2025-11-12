import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diaryApi } from '../../api/diaryApi';
export const useDiaryEntries = () => {
    return useQuery({
        queryKey: ['diary'],
        queryFn: () => diaryApi.getMyEntries(),
    });
};
export const useDiaryEntry = (id) => {
    return useQuery({
        queryKey: ['diary', id],
        queryFn: () => diaryApi.getEntry(id),
        enabled: !!id,
    });
};
export const useCreateDiaryEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entry) => diaryApi.createEntry(entry),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diary'] });
        },
    });
};
export const useUpdateDiaryEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, entry }) => diaryApi.updateEntry(id, entry),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['diary'] });
            queryClient.invalidateQueries({ queryKey: ['diary', data.id] });
        },
    });
};
export const useDeleteDiaryEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => diaryApi.deleteEntry(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diary'] });
        },
    });
};
