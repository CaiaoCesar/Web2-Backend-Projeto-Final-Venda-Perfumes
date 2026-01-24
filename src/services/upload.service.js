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

        // Validação das chaves de ambiente
        if (!process.env.UPLOADCARE_PUBLIC_KEY || !process.env.UPLOADCARE_SECRET_KEY) {
            throw new Error('As chaves do Uploadcare (PUBLIC e/ou SECRET) não estão configuradas no .env');
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

        // Buscamos a base do .env
        const cdnBase = process.env.UPLOADCARE_CDN_BASE;

        // Se a variável não existir, lançamos um erro
        if (!cdnBase) {
            throw new Error('A variável UPLOADCARE_CDN_BASE não foi configurada no arquivo .env');
        }

        // Se chegou aqui, é porque a variável existe, então tratamos a barra final
        const cdnUrlLimpa = cdnBase.endsWith('/') ? cdnBase : `${cdnBase}/`;
        const urlCdnUploadcare = `${cdnUrlLimpa}${arquivo.uuid}/`;
        
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

        // 
        if (response.ok) {
            console.log(`✅ Sucesso: O arquivo ${fileId} não está mais no storage.`);
            return true;
        }

        // Status é de erro (4xx ou 5xx)
        const status = response.status;
        const erroCorpo = await response.text();
        
        // Caso o arquivo já tenha sido removido anteriormente, o Uploadcare pode retornar 404
        if (status === 404) {
            console.warn(`Aviso: Arquivo ${fileId} já não existia ou já foi removido.`);
            return true; // Retorna true já que o objetivo era nao ter arquivo
        }

        console.error(`Erro na API (Status ${status}):`, erroCorpo);
        return false;

    } catch (error) {
        console.error("Erro de conexão ao remover do storage:", error.message);
        return false;
    }
};

export default {
    uploadImgUploadcare,
    apagaDoUploadCare,
}