export async function consultarCep(cep: string) {
    try {
        const url = `https://viacep.com.br/ws/${cep}/json/`

        const resposta = await fetch(url)
        const dados = await resposta.json()

        return dados

    } catch (erro) {
        console.log("Erro ao buscar cep", erro)
        return null
    }
}