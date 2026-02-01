import { UploadClient } from "@uploadcare/upload-client";
import { AppError } from '../utils/AppError.js'; // Importação obrigatória

const clientUploadcare = new UploadClient({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});

/**
 * Faz o upload de uma imagem para o Uploadcare
 */
export const uploadImgUploadcare = async (fileBuffer, fileName, mimeType) => {
    try {
        // 1. Validação de arquivo (Erro do Usuário: 400)
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new AppError('O arquivo enviado está vazio ou é inválido.', 400);
        }

        // 2. Validação de Ambiente (Erro do Servidor: 500)
        if (!process.env.UPLOADCARE_PUBLIC_KEY || !process.env.UPLOADCARE_SECRET_KEY) {
            throw new AppError('Configuração do servidor incompleta (Chaves de Upload).', 500);
        }

        const arquivo = await clientUploadcare.uploadFile(fileBuffer, {
            fileName: fileName, 
            contentType: mimeType,
            store: '1', 
        });

        // Confirmação de armazenamento via API REST
        try {
            const storeResponse = await fetch(`https://api.uploadcare.com/files/${arquivo.uuid}/storage/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                },
            });

            if (!storeResponse.ok) {
                console.warn('[UPLOAD] Aviso: O arquivo foi enviado, mas o armazenamento permanente não pôde ser confirmado.');
            }
        } catch (storeError) {
            console.warn('[UPLOAD] Falha na comunicação de storage:', storeError.message);
        }

        const cdnBase = process.env.UPLOADCARE_CDN_BASE;
        if (!cdnBase) {
            throw new AppError('Configuração do servidor incompleta (CDN Base ausente).', 500);
        }

        const cdnUrlLimpa = cdnBase.endsWith('/') ? cdnBase : `${cdnBase}/`;
        return `${cdnUrlLimpa}${arquivo.uuid}/`;

    } catch (error) {
        // Se já for um AppError, apenas repassa. Se não, encapsula como 500.
        if (error instanceof AppError) throw error;
        
        throw new AppError(`Falha técnica no serviço de imagens: ${error.message}`, 500);
    }
};

/** * Deleta um arquivo do Uploadcare
 */
export const apagaDoUploadCare = async (fileId) => {
    try {
        if (!fileId) return false;

        const response = await fetch(
            `https://api.uploadcare.com/files/${fileId}/storage/`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                    'Accept': 'application/vnd.uploadcare-v0.7+json',
                },
            }
        );

        if (response.ok || response.status === 404) {
            return true; 
        }

        // Se falhar a deleção por outro motivo, lançamos erro para o Log
        throw new Error(`Status ${response.status}`);
    } catch (error) {
        console.error(`[UPLOAD] Não foi possível remover a imagem ${fileId}:`, error.message);
        // Em deleções, às vezes optamos por não travar o fluxo principal (ex: excluir perfume)
        // mas é bom registrar o erro.
        return false;
    }
};

export default {
    uploadImgUploadcare,
    apagaDoUploadCare,
}