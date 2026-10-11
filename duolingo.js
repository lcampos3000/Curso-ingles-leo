(function moduloDuolingo(){
  "use strict";
  if (!db || !db.state || !document.querySelector(".nav")) return;
  if (!Array.isArray(db.state.externalPractices)) db.state.externalPractices = [];
  const menu=document.querySelector(".nav");
  if (!menu.querySelector('[data-tab="duolingo"]')){
    const b=document.createElement("button");
    b.dataset.tab="duolingo";b.textContent="Duolingo · conversas";
    const before=menu.querySelector('[data-tab="memory"]');
    menu.insertBefore(b,before||null);
    b.addEventListener("click",()=>nav("duolingo"));
  }

  function promptDuolingo(){
    const d=new Date(), today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
    const errs=db.state.errors.slice(-8).filter(x=>x.original&&x.correction).map(x=>"- "+x.original+" → "+x.correction).join("\n")||"Sem registro recente.";
    const rev=db.state.nextReview.slice(-6).join("; ")||"Sem revisões recentes.";
    return `SISTEMA LÉO — REGISTRO DE PRÁTICA EXTERNA (DUOLINGO)
Data de referência: ${today}.
Estudante: ${db.profile.name}. Objetivos: ${db.profile.goal}.
Interesses: ${db.profile.interests}.

Você é meu tutor de inglês e analista pedagógico do Sistema Léo. Vou colar uma transcrição integral da minha chamada com a Lily (Duolingo), incluindo as falas de Lily e as minhas. Espere a transcrição se ela ainda não estiver nesta mensagem. NÃO simule uma chamada, NÃO comece outra aula e NÃO reescreva a transcrição original como se fosse minha fala corrigida.

PRIORIDADES DA ANÁLISE
1. Compreender o que eu consegui comunicar espontaneamente, minha iniciativa e como respondi à interlocutora.
2. Identificar acertos concretos, erros comprovados e formas mais naturais de expressar as MESMAS ideias. Preserve literalmente as frases originais entre as correções.
3. Dar prioridade a padrões recorrentes e exemplos úteis. Não transformar todo erro em exercício.
4. Distinguir compreensão contextual observada de compreensão auditiva comprovada. Sem áudio confiável, não pontuar pronúncia, velocidade nem fluência temporal. Não inventar tempo de duração nem pontuação.
5. Comparar com dificuldades históricas somente quando há dados: ${errs}
Revisões em andamento: ${rev}
6. Produzir um feedback em português claro. Ofereça conversarmos sobre o feedback em voz, com duração flexível, quando eu quiser. A conversa de feedback acontece DEPOIS da minha prática no Duolingo, não durante ela.

IMPORTANTE SOBRE O FLUXO
ETAPA A — RECEBIMENTO DO PROMPT: se eu colar somente este prompt, não faça análise, não inicie aula, não gere relatório e não antecipe feedback. Responda apenas que está aguardando a transcrição.
ETAPA B — RECEBIMENTO DA TRANSCRIÇÃO: se eu enviar a transcrição (isoladamente ou junto deste prompt), apenas registre o conteúdo como fonte da prática, SEM exibir análise, correções, diagnóstico, resumo avaliativo ou JSON. Pergunte EXATAMENTE: "Recebi sua conversa com o Duolingo! Você prefere 1) conversar sobre a atividade ou 2) gerar o relatório para exportar à plataforma?"
ETAPA C — ESCOLHA DO ESTUDANTE: somente se eu escolher a opção 1, faça o feedback dialogado em português (por voz ou texto), conversando sobre acertos, dificuldades e alternativas naturais, conforme minhas perguntas; não gere o JSON nessa etapa. Ao final, ofereça a exportação. Se eu escolher a opção 2, gere diretamente o JSON de retorno sem apresentar uma análise separada antes.
ETAPA D — EXPORTAÇÃO: se depois da conversa de feedback eu disser "gerar relatório", "finalizar" ou "prompt de retorno", produza o JSON estruturado abaixo, usando a transcrição original e as evidências discutidas. Nunca invente falas, áudio, duração nem pontuações. Não imponha tempo rígido, nem exija repetição de frases.

RELATÓRIO PARA DEVOLVER À PLATAFORMA
Gere um único objeto JSON VÁLIDO entre RELATORIO_INICIO e RELATORIO_FIM, sem crases de bloco de código. Use UTF-8, aspas duplas e nulos reais quando desconhecidos. Não invente conteúdo.
Inclua estes campos:
{
 "tipo":"pratica_externa",
 "origem":"Duolingo",
 "interlocutor":"Lily",
 "data":"${today}",
 "titulo_aula":"Prática Duolingo — tema principal",
 "resumo":"...",
 "nivel_observado":"estimativa textual com ressalvas",
 "minutos":null,
 "total_falas_estudante":null,
 "transcricao_original":"REPRODUZA AQUI TODA A TRANSCRIÇÃO RECEBIDA, SEM CORRIGI-LA",
 "pontos_fortes":["..."],
 "dificuldades":["..."],
 "erros":[{"original":"...","correction":"...","explanation":"...","priority":"alta"}],
 "vocabulario":[{"term":"...","meaning":"...","example":"...","mastery":null}],
 "proxima_revisao":["..."],
 "recomendacao":"...",
 "avaliacao":{"compreensao_contextual":"...","autonomia":"...","interacao":"...","precisao":"...","limites_da_evidencia":"..."}
}
RELATORIO_INICIO
{JSON válido, substituindo o exemplo acima pelos dados reais}
RELATORIO_FIM

Confira se a transcrição está integral e se os exemplos corrigidos correspondem ao que foi realmente falado. Se houver incerteza ou erro de transcrição, indique isso na explicação.
Se ainda não enviei a transcrição, aguarde sem analisar. Quando eu a enviar, faça apenas a pergunta de escolha definida na ETAPA B e espere minha resposta.`;
  }

  function duoView(){
    const all=db.state.externalPractices||[];
    const recent=all.slice().reverse().map((p,i)=>{
      const r=p.report||{};
      const erros=Array.isArray(r.erros)?r.erros:[];
      const vocab=Array.isArray(r.vocabulario)?r.vocabulario:[];
      const f=Array.isArray(r.pontos_fortes)?r.pontos_fortes:[];
      const d=Array.isArray(r.dificuldades)?r.dificuldades:[];
      const txt=(arr)=>arr.map(x=>`<li>${esc(x)}</li>`).join("");
      return `<details class="step"><summary><b>${esc(r.data||p.importedAt||"Sem data")}</b> · ${esc(r.titulo_aula||"Conversa externa")} <span class="muted small">(${erros.length} correções)</span></summary>
        <p>${esc(r.resumo||"")}</p>
        <p class="small muted"><b>Origem:</b> ${esc(r.origem||"Duolingo")} · <b>Nível indicativo:</b> ${esc(r.nivel_observado||"Não avaliado")}</p>
        <p><b>Potencialidades</b></p><ul>${txt(f)}</ul><p><b>Dificuldades</b></p><ul>${txt(d)}</ul>
        <p><b>Correções</b></p>${erros.map(e=>`<div class="step"><b>${esc(e.original||"")}</b><div class="ok">${esc(e.correction||"")}</div><p class="small muted">${esc(e.explanation||"")}</p></div>`).join("")}
        <p><b>Vocabulário</b></p><ul>${vocab.map(v=>`<li>${esc(v.term||"")} — ${esc(v.meaning||"")}</li>`).join("")}</ul>
        <p><b>Recomendação:</b> ${esc(r.recomendacao||"")}</p>
        <details><summary>Ver transcrição original preservada</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:350px;overflow:auto">${esc(r.transcricao_original||"Não fornecida")}</pre></details>
      </details>`;
    }).join("");
    return `<section class="grid">
      <div class="card span8"><div class="row" style="justify-content:space-between"><h2>Práticas externas · Duolingo</h2><span class="badge">${all.length} ${all.length===1?"conversa":"conversas"}</span></div>
      <p class="muted">Importe suas conversas com Lily sem misturá-las com as aulas regulares. A análise acontece no ChatGPT e volta para cá como relatório estruturado.</p>
      <div class="step"><b>1 · Copiar prompt</b><p>Gere o comando de análise e cole no ChatGPT ou Gemini.</p>
      <button onclick="copyDuolingoPrompt()">Copiar prompt da prática</button></div>
      <div class="step"><b>2 · Colar a conversa</b><p>Cole no chat a transcrição integral da chamada. Eu perguntarei se você prefere conversar sobre a prática ou gerar diretamente o relatório para exportação.</p></div>
      <div class="step"><b>3 · Devolver o relatório</b><p>Cole abaixo o JSON entre RELATORIO_INICIO e RELATORIO_FIM. A plataforma verificará o formato antes de registrar.</p></div>
      <h3>Importar resultado do Duolingo</h3>
      <textarea id="duoReport" style="min-height:220px" placeholder="RELATORIO_INICIO&#10;{ &quot;tipo&quot;: &quot;pratica_externa&quot;, ... }&#10;RELATORIO_FIM"></textarea>
      <div class="actions"><button class="green" onclick="importDuolingoReport()">Registrar conversa e atualizar memória</button></div>
      <p class="small muted">A transcrição original será preservada no relatório. Não serão atribuídos pontos artificiais a pronúncia, audição ou tempo de conversa.</p></div>
      <div class="card span4"><h3>Como isso afeta o curso?</h3><p>Os erros comprovados, novas expressões e recomendações alimentam a memória e as revisões das próximas aulas.</p><p>O número de <b>aulas regulares</b> e a média numérica de habilidades <b>não</b> aumentam com uma transcrição sem evidência equivalente.</p><p class="small muted">Os registros ficam no armazenamento local deste navegador. Faça cópias periódicas em Configurações → Baixar backup.</p></div>
      <div class="card span12"><div class="row" style="justify-content:space-between"><h2>Histórico de conversas externas</h2><span class="pill">${all.length} registros</span></div>${recent||'<p class="muted">Ainda não há conversas importadas. A chamada com Lily de 11/10 pode ser a primeira.</p>'}</div>
    </section>`;
  }

  const oldRender=render;
  render=function(tab="home"){
    if(tab==="duolingo"){document.querySelector("#app").innerHTML=duoView();return;}
    return oldRender(tab);
  };

  window.copyDuolingoPrompt=async function(){
    const p=promptDuolingo();
    let copied=false;
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(p);copied=true;}}catch(e){}
    showPromptCopy(p,copied);
    const title=document.querySelector("#promptCopyModal h2");
    if(title)title.textContent="Prompt de análise — Duolingo";
  };

  window.importDuolingoReport=function(){
    const field=document.querySelector("#duoReport");
    const raw=(field?.value||"").trim();
    if(!raw)return toast("Cole o relatório de retorno.");
    const r=extractJson(raw);
    if(!r||r.tipo!=="pratica_externa"||!String(r.origem||"").toLowerCase().includes("duolingo")){
      return toast("Relatório inválido: gere o JSON específico do Duolingo.");
    }
    if(typeof r.transcricao_original!=="string"||r.transcricao_original.trim().length<20){
      return toast("O relatório precisa preservar a transcrição original.");
    }
    if(!r.resumo||!Array.isArray(r.erros)||!Array.isArray(r.vocabulario)||!Array.isArray(r.proxima_revisao)){
      return toast("Faltam campos obrigatórios no relatório.");
    }
    const list=db.state.externalPractices||[];
    if(list.some(p=>p.report?.transcricao_original===r.transcricao_original && p.report?.data===r.data)){
      return toast("Esta conversa já está registrada.");
    }
    const next=JSON.parse(JSON.stringify(db));
    if(!Array.isArray(next.state.externalPractices))next.state.externalPractices=[];
    const date=new Date().toLocaleDateString("pt-BR");
    const item={id:"duo-"+Date.now(),importedAt:date,report:r};
    next.state.externalPractices.push(item);
    for(const e of r.erros){
      if(e&&typeof e.original==="string"&&typeof e.correction==="string"&&e.original.trim()&&e.correction.trim()){
        next.state.errors.push({original:e.original,correction:e.correction,explanation:e.explanation||"",priority:e.priority||"média",date,source:"Duolingo",practiceId:item.id});
      }
    }
    for(const v of r.vocabulario){
      if(v&&typeof v.term==="string"&&v.term.trim()){
        next.state.vocab.push({term:v.term,meaning:v.meaning||"",example:v.example||"",mastery:Number.isFinite(Number(v.mastery))&&v.mastery!==null?pct(v.mastery):null,date,source:"Duolingo",practiceId:item.id});
      }
    }
    next.state.nextReview=[...new Set([...next.state.nextReview,...r.proxima_revisao.filter(x=>typeof x==="string"&&x.trim())])].slice(-80);
    if(typeof r.recomendacao==="string"&&r.recomendacao.trim()){
      next.state.currentFocus=r.recomendacao;
    }
    next.state.history.push({date: r.data||date,summary:r.resumo,focus:"Prática externa · Duolingo",type:"external",practiceId:item.id});
    try{localStorage.setItem(KEY,JSON.stringify(next));}
    catch(e){return toast("Não foi possível salvar. Faça backup e verifique o espaço do navegador.");}
    db=next;
    nav("duolingo");
    toast("Conversa do Duolingo registrada. Histórico e revisões atualizados.");
  };
})();
