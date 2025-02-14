import { Link } from "react-router-dom";

export default function Main() {
    return (
        <>
            <h3>Seja bem-vindo 😊</h3><br/>

            <Link className="btn btn-primary w-100" to={'/get-password'}>Tela para gerar senhas</Link><br/>
            <Link className="btn btn-primary w-100 mt-3" to={'/client'}>Painel chamada</Link><br/>
            <Link className="btn btn-primary w-100 mt-3" to={'/window'}>Guichê (chamar senhas)</Link>
        </>
    )
}