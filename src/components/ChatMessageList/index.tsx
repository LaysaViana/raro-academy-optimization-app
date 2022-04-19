import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/chat.context";
import { useScroll } from "../../hooks/useScroll";
import { ChatMessage } from "../ChatMessage";
import { ChatMessageListBottomScrollButton } from "../ChatMessageListBottomScrollButton";
import { MyChatMessage } from "../MyChatMessage";

// número totalmente arbitrário...
const TAMANHO_MEDIO_MENSAGEM_PX = 300;
export const ChatMessageList = () => {
  const QUANTIDADE_POR_PAGINA = 10;
  const [paginasParaExibir, setPaginasParaExibir] = useState(1)
  const scrollRef: MutableRefObject<Element | null> = useRef(null);
  const { mensagens, buscaMensagem, setMensagens } = useChat();

  const {
    scrollBottom,
    endOfScroll,
    updateEndOfScroll,
    getDistanceFromBottom,
    posicao,
    altura
  } = useScroll(scrollRef);

  useEffect(() => {
    scrollRef.current = document.querySelector('#mensagens');
    lerNovasMensagens();
  }, []);

  useEffect(() => {
    updateEndOfScroll();
  }, [mensagens, updateEndOfScroll]);

  useEffect(() => {
    const novaMensagem = mensagens[0];
    const distanceFromBottom = getDistanceFromBottom();
    const lerProximaMensagem = distanceFromBottom < TAMANHO_MEDIO_MENSAGEM_PX;
    const minhaMensagem = novaMensagem?.autor.usuarioAtual

    if (minhaMensagem || lerProximaMensagem) {
      lerNovasMensagens();
    }
  }, [mensagens.length]);

  useEffect(() => {
    const incrementarPagina = () => {
      const limite = altura * 0.8;
      const totalMensagens = (paginasParaExibir + 1) * QUANTIDADE_POR_PAGINA
      if (posicao > limite && totalMensagens < mensagens.length) {
        setPaginasParaExibir(paginasParaExibir + 1);
        console.log(paginasParaExibir + 1)
      }
    }

    updateEndOfScroll();
    incrementarPagina();
  }, [posicao, altura]);

  const lerNovasMensagens = () => {
    scrollBottom();
    mensagens.forEach(mensagem => {
      mensagem.lida = true;
    });
    setMensagens([...mensagens]);
  };

  return (
    <div id="mensagens" className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-purple scrollbar-thumb-rounded scrollbar-track-indigo-lighter scrollbar-w-2 scrolling-touch">
      {
        [...mensagens]
          .filter(mensagem => mensagem.texto.match(new RegExp(buscaMensagem, 'i')))
          .slice(0, QUANTIDADE_POR_PAGINA * paginasParaExibir)
          .reverse()
          .map(mensagem => (
            mensagem.autor.usuarioAtual ?
              <MyChatMessage key={mensagem.id} mensagem={mensagem} /> :
              <ChatMessage key={mensagem.id} mensagem={mensagem} />
          ))
      }
      {
        !endOfScroll ? (
          <ChatMessageListBottomScrollButton
            onClick={() => lerNovasMensagens()}
            naoLidos={mensagens.filter(m => !m.lida).length}
          />
        ) : <></>
      }
    </div>
  );
}