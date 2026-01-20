// src/services/upload.service.js
import { UploadClient } from "@uploadcare/upload-client";

const clientUploadcare = new UploadClient({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});

/**
 * @param {Buffer} fileBuffer - Buffer do arquivo a ser enviado
 * @param {string} fileName - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo a ser enviado (ex: 'image/jpeg')
 * @returns {Promise<string>} URL do arquivo enviado
 */
export const uploadImgUploadcare = async (fileBuffer, fileName, mimeType) => {
    try {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error('Arquivo inválido ou vazio');
        }

        if (!process.env.UPLOADCARE_PUBLIC_KEY) {
            throw new Error('Chave pública (UPLOADCARE_PUBLIC_KEY) do Uploadcare não está configurada nas variáveis de ambiente.');
        }

        console.log('Iniciando upload do arquivo para o Uploadcare:', {
            fileName,
            mimeType,
            size: `${(fileBuffer.length / 1024).toFixed(2)} KB`, // FIX: toFixed estava fora do lugar
        });

        const arquivo = await clientUploadcare.uploadFile(fileBuffer, {
            fileName: fileName, 
            contentType: mimeType,
            store: '1', // '1' força armazenamento imediato
        });

        console.log("Arquivo enviado. UUID:", arquivo.uuid);

        // Aguardar um momento para o Uploadcare processar
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Confirmar armazenamento do arquivo (caso "Automatic file storing" esteja OFF)
        try {
            const storeResponse = await fetch(`https://api.uploadcare.com/files/${arquivo.uuid}/storage/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                },
            });

            if (!storeResponse.ok) {
                console.warn('Aviso: Não foi possível confirmar armazenamento, mas arquivo pode estar salvo.');
            } else {
                console.log("Armazenamento confirmado com sucesso!");
            }
        } catch (storeError) {
            console.warn('Aviso ao confirmar armazenamento:', storeError.message);
        }

        // url cdn do uploadcare default
        const urlCdnUploadcare = `https://2a8kfg8gba.ucarecd.net/${arquivo.uuid}/`;
        
        console.log("Upload concluído com sucesso!");
        console.log("UUID:", arquivo.uuid);
        console.log("URL gerada (Correta):", urlCdnUploadcare);

        // Retornar a URL que o Uploadcare forneceu diretamente
        return urlCdnUploadcare;
    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error(`Falha ao fazer o upload da imagem: ${error.message}`);
    }
};

/** 
 * Deleta um arquivo do Uploadcare
 * @param {string} fileId - UUID do arquivo do UploadCare
 * @returns {Promise<boolean>} Se foi apagado retorna True
 */
export const apagaDoUploadCare = async (fileId) => {
    try {
        console.log("Deleção ainda não implementada:", fileId);
        // TODO: Implementar usando DeleteFileCommand do Uploadcare REST API
        return false;
    } catch (error) {
        console.error("Erro ao deletar arquivo:", error);
        return false;
    }
};

export default {
    uploadImgUploadcare,
    apagaDoUploadCare,
}