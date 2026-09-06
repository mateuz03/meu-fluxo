# Meu Fluxo

Crie uma aplicação web responsiva chamada provisoriamente de “Meu Financeiro”, voltada para gestão financeira pessoal.

A aplicação deve ajudar o usuário a registrar, organizar e acompanhar:

Receitas;

Despesas;

Contas bancárias;

Cartões de crédito;

Compras parceladas;

Contas recorrentes;

Investimentos;

Patrimônio;

Dívidas;

Orçamentos mensais;

Planejamentos futuros;

Metas e objetivos financeiros.

O sistema deve oferecer uma visão clara da situação financeira atual, mostrar para onde o dinheiro está indo e ajudar o usuário a planejar os próximos meses.

Direção do produto

Inicialmente, a aplicação será de uso pessoal, mas sua arquitetura deve permitir vários usuários no futuro.

O produto deve priorizar:

Simplicidade;

Privacidade;

Clareza dos números;

Facilidade para registrar movimentações;

Boa experiência no celular;

Cálculos financeiros consistentes;

Visual profissional e moderno.

Não transformar a aplicação em um sistema contábil complexo.

Backend

Utilize um projeto Supabase exclusivo para esta aplicação, separado de qualquer outro sistema.

Implementar:

Supabase Auth;

PostgreSQL;

Row Level Security;

Migrations versionadas;

Tipos TypeScript gerados com base no banco;

Proteção dos dados por usuário;

Estrutura preparada para exportação e exclusão dos dados.

Antes de executar migrations ou modificar o banco, apresente as alterações e solicite aprovação.

Autenticação

Criar:

Cadastro com nome, e-mail e senha;

Login;

Confirmação de e-mail;

Recuperação de senha;

Redefinição de senha;

Sessão persistente;

Logout;

Exclusão da conta.

Nenhuma página financeira deve ficar disponível sem autenticação.

Cada usuário deve visualizar e modificar somente os próprios dados.

Configuração inicial

Após o primeiro acesso, apresentar um onboarding curto para configurar:

Nome;

Moeda principal, usando BRL como padrão;

Saldo financeiro inicial;

Contas bancárias;

Cartões de crédito;

Renda mensal estimada;

Dia principal de recebimento;

Objetivo financeiro inicial;

Preferência entre tema claro, escuro ou automático.

Permitir pular etapas e completar depois.

Identidade visual

Criar uma identidade visual inspirada em aplicativos financeiros modernos, transmitindo segurança, organização e tranquilidade.

Paleta sugerida:

Azul-marinho como cor principal;

Verde-esmeralda para valores positivos;

Vermelho suave para despesas e valores negativos;

Amarelo ou laranja para alertas;

Branco e cinza-claro nos fundos;

Tons escuros para o modo noturno.

Utilizar:

Cards arredondados;

Ícones simples;

Gráficos limpos;

Tipografia moderna;

Boa hierarquia visual;

Animações discretas;

Contraste acessível.

Não depender apenas de cores para indicar situações positivas ou negativas. Utilizar também textos e ícones.

Navegação

No celular, criar um menu inferior com:

Início;

Movimentações;

Planejamento;

Investimentos;

Perfil.

Adicionar um botão central destacado “+” para novo lançamento.

No desktop, transformar a navegação em uma barra lateral.

1. Dashboard

O dashboard deve apresentar:

Saudação personalizada;

Saldo total disponível;

Receitas do mês;

Despesas do mês;

Resultado mensal;

Valores previstos e realizados;

Total das próximas contas;

Faturas de cartão abertas;

Patrimônio líquido;

Valor total investido;

Progresso das principais metas;

Comparação com o mês anterior.

Adicionar gráficos para:

Receitas versus despesas;

Despesas por categoria;

Evolução mensal do saldo;

Evolução do patrimônio;

Distribuição dos investimentos.

Adicionar ações rápidas:

Registrar receita;

Registrar despesa;

Fazer transferência;

Registrar investimento;

Criar meta;

Criar planejamento.

Quando não existirem dados, mostrar estados vazios amigáveis explicando como começar.

2. Contas financeiras

Permitir cadastrar:

Conta-corrente;

Conta-poupança;

Dinheiro;

Carteira digital;

Conta de investimentos;

Outras contas;

Dívidas ou financiamentos.

Cada conta deve possuir:

Nome;

Instituição;

Tipo;

Cor e ícone;

Saldo inicial;

Saldo atual calculado;

Moeda;

Status ativo ou arquivado;

Observações.

Não permitir editar diretamente o saldo calculado. Para corrigir uma diferença, criar uma movimentação de ajuste com histórico.

3. Movimentações

Criar três tipos principais:

Receita;

Despesa;

Transferência.

Campos:

Descrição;

Valor;

Categoria;

Subcategoria;

Conta;

Data da movimentação;

Data de vencimento;

Data de pagamento;

Status: previsto, pendente, pago ou cancelado;

Forma de pagamento;

Tags;

Observações;

Comprovante opcional;

Recorrência;

Parcelamento.

Permitir:

Criar;

Editar;

Duplicar;

Excluir;

Filtrar;

Pesquisar;

Dividir uma movimentação entre categorias;

Marcar como paga;

Criar movimentações recorrentes;

Visualizar histórico de alterações.

Regras financeiras obrigatórias

Implementar corretamente estas regras:

Uma transferência movimenta dinheiro entre contas, mas não é receita nem despesa;

A saída e a entrada de uma transferência devem permanecer vinculadas;

Excluir uma transferência deve tratar as duas pontas;

Pagamento de fatura do cartão não deve ser contado novamente como despesa;

A compra feita no cartão deve ser contabilizada apenas uma vez;

Parcelamentos devem gerar parcelas futuras vinculadas à compra original;

Alterar a compra original deve atualizar somente parcelas ainda não pagas, após confirmação;

Movimentações canceladas não entram nos totais;

Não utilizar números de ponto flutuante para valores monetários;

Valores devem ser armazenados com precisão decimal;

Todos os totais do dashboard precisam ser conciliáveis com a lista de movimentações.

4. Cartões de crédito

Permitir cadastrar:

Nome do cartão;

Instituição;

Bandeira;

Limite;

Dia de fechamento;

Dia de vencimento;

Cor;

Final do cartão, opcional.

Apresentar:

Limite utilizado;

Limite disponível;

Fatura atual;

Próxima fatura;

Compras parceladas;

Parcelas futuras;

Histórico de faturas;

Melhor data de compra como informação calculada a partir do fechamento.

Ao registrar uma compra, permitir:

Compra à vista;

Compra parcelada;

Seleção da categoria;

Definição da primeira fatura;

Antecipação manual de parcelas;

Cancelamento ou estorno.

O pagamento da fatura deve ser tratado como transferência da conta bancária para a dívida do cartão, evitando duplicidade de despesas.

5. Orçamento mensal

Permitir criar limites mensais para:

Categorias;

Subcategorias;

Gastos variáveis;

Gastos pessoais;

Lazer;

Alimentação;

Transporte;

Moradia;

Saúde;

Educação;

Assinaturas.

Apresentar:

Valor planejado;

Valor utilizado;

Valor restante;

Percentual consumido;

Comparação com o mês anterior;

Projeção até o final do mês.

Usar indicadores para:

Dentro do orçamento;

Próximo do limite;

Limite ultrapassado.

As projeções devem ser identificadas como estimativas baseadas nos dados registrados.

6. Contas recorrentes e assinaturas

Criar uma área para controlar:

Aluguel;

Condomínio;

Energia;

Água;

Internet;

Telefone;

Streaming;

Academia;

Seguros;

Mensalidades;

Outras assinaturas.

Permitir definir:

Frequência;

Valor fixo ou variável;

Próximo vencimento;

Data final opcional;

Conta de pagamento;

Categoria;

Lembrete;

Reajuste manual.

Mostrar o custo mensal e anual estimado das assinaturas.

7. Investimentos

Criar uma área para acompanhamento manual de investimentos.

Categorias:

Reserva financeira;

Renda fixa;

Tesouro Direto;

CDB, LCI e LCA;

Ações;

Fundos imobiliários;

ETFs;

Fundos;

Previdência;

Criptomoedas;

Investimentos internacionais;

Outros.

Cada ativo pode possuir:

Nome;

Código ou ticker;

Instituição ou corretora;

Categoria;

Quantidade;

Preço médio;

Valor investido;

Valor atual;

Data de atualização do valor;

Rentabilidade nominal;

Rendimentos recebidos;

Taxas;

Observações.

Permitir registrar:

Aplicação;

Compra;

Venda;

Resgate;

Rendimento;

Dividendo;

Juros;

Taxa;

Ajuste.

Apresentar:

Total investido;

Valor atual;

Rentabilidade;

Evolução patrimonial;

Distribuição por categoria;

Distribuição por instituição;

Histórico de aportes;

Rendimentos recebidos.

No MVP, utilizar valores atualizados manualmente.

Não inventar cotações e não apresentar valores como atuais sem informar a data da última atualização.

Não recomendar compra, venda ou alocação de investimentos. O sistema deve apenas organizar e apresentar os dados registrados pelo usuário.

8. Metas financeiras

Permitir criar objetivos como:

Reserva de emergência;

Viagem;

Compra de veículo;

Entrada de imóvel;

Quitação de dívida;

Curso;

Aposentadoria;

Projeto pessoal;

Outro objetivo.

Cada meta deve possuir:

Nome;

Descrição;

Valor desejado;

Valor acumulado;

Data inicial;

Data desejada;

Prioridade;

Conta vinculada;

Imagem ou ícone;

Status.

Mostrar:

Percentual concluído;

Valor restante;

Tempo restante;

Aporte mensal necessário como simulação;

Histórico de contribuições;

Previsão de conclusão baseada no aporte informado pelo usuário.

Deixar claro que previsões são estimativas e não garantias.

9. Planejamentos futuros

Criar uma área para simular decisões futuras.

Permitir criar cenários:

Cenário atual;

Cenário conservador;

Cenário planejado;

Cenário personalizado.

O usuário poderá informar eventos futuros como:

Aumento ou redução de renda;

Nova despesa;

Compra planejada;

Viagem;

Financiamento;

Quitação de dívida;

Novo investimento;

Aporte mensal;

Alteração de assinatura;

Despesa extraordinária.

Mostrar uma projeção mensal de até 5 anos contendo:

Receitas previstas;

Despesas previstas;

Resultado mensal;

Saldo acumulado;

Evolução do patrimônio;

Progresso das metas.

Toda projeção deve mostrar claramente:

Premissas utilizadas;

Valores inseridos pelo usuário;

Período projetado;

Data de criação;

Aviso de que se trata de uma simulação.

Não gerar previsões ocultas ou números sem explicar a origem.

10. Patrimônio e dívidas

Calcular:

Patrimônio líquido = soma dos ativos − soma das dívidas.

Apresentar separadamente:

Dinheiro disponível;

Investimentos;

Bens cadastrados;

Cartões e faturas;

Empréstimos;

Financiamentos;

Outras dívidas;

Patrimônio líquido.

Para dívidas, permitir cadastrar:

Credor;

Valor original;

Saldo devedor;

Número de parcelas;

Valor da parcela;

Taxa informada pelo usuário;

Próximo vencimento;

Data estimada de término;

Status.

Não criar aconselhamento automático sobre contratação ou quitação de dívidas.

11. Calendário financeiro

Criar um calendário contendo:

Recebimentos;

Vencimentos;

Faturas;

Parcelas;

Aportes;

Metas;

Assinaturas;

Eventos de planejamento.

Permitir visualizar por:

Dia;

Semana;

Mês;

Lista.

Usar o fuso horário America/Sao_Paulo.

12. Relatórios

Criar relatórios de:

Fluxo de caixa;

Receitas e despesas;

Despesas por categoria;

Evolução mensal;

Orçamento planejado versus realizado;

Gastos recorrentes;

Cartões;

Investimentos;

Patrimônio;

Dívidas;

Metas.

Adicionar filtros por:

Período;

Conta;

Categoria;

Cartão;

Status;

Tag.

Permitir exportar os dados em CSV e gerar uma versão para impressão ou PDF.

Estrutura inicial do banco

Criar tabelas para:

profiles;

accounts;

categories;

transactions;

transaction_splits;

transfer_links;

recurrence_rules;

credit_cards;

card_invoices;

card_installments;

budgets;

subscriptions;

investment_assets;

investment_transactions;

financial_goals;

goal_contributions;

debts;

financial_plans;

plan_events;

reminders;

attachments;

audit_events.

As entidades financeiras devem incluir, quando aplicável:

id;

user_id;

created_at;

updated_at;

deleted_at;

currency;

status.

Criar chaves estrangeiras, constraints e índices adequados.

Segurança

Aplicar Row Level Security em todas as tabelas expostas.

As policies devem garantir que:

Usuários autenticados consultem apenas os próprios registros;

Usuários alterem somente os próprios registros;

Inserts só aceitem user_id igual ao usuário autenticado;

Updates utilizem regras de USING e WITH CHECK;

Nenhum usuário acesse dados financeiros de outra conta;

Usuários anônimos não acessem tabelas financeiras.

Não usar apenas “authenticated” como autorização. Validar também a propriedade do registro por user_id.

Não utilizar service role no frontend.

Não armazenar:

Senhas bancárias;

Senhas de cartões;

Tokens bancários no navegador;

Número completo do cartão;

Código de segurança;

Chaves secretas no código;

Informações financeiras sensíveis em URLs ou logs.

Comprovantes enviados devem ficar em bucket privado, com políticas de acesso por usuário e URLs temporárias assinadas.

Privacidade

Implementar:

Exportação dos dados;

Exclusão da conta;

Exclusão dos registros;

Confirmação para ações destrutivas;

Política de privacidade;

Registro mínimo de auditoria;

Preparação para LGPD.

A aplicação não deve vender, compartilhar ou expor dados financeiros.

Aviso obrigatório

Mostrar nas configurações, nos planejamentos e na área de investimentos:

“Esta aplicação é uma ferramenta de organização financeira pessoal. As informações, cálculos e projeções apresentadas não constituem recomendação financeira, contábil, tributária ou de investimento. Verifique decisões importantes com um profissional qualificado.”

Estados da interface

Todas as telas devem possuir estados de:

Carregamento;

Sucesso;

Erro;

Lista vazia;

Sem permissão;

Sem conexão;

Confirmação;

Dados desatualizados.

Criar mensagens claras e amigáveis, sem expor erros técnicos ou informações sensíveis.

Acessibilidade e responsividade

Garantir:

Funcionamento em celular, tablet e desktop;

Navegação por teclado;

Foco visível;

Labels nos formulários;

Contraste adequado;

Textos legíveis;

Áreas de toque confortáveis;

Formatação brasileira de moeda e datas.

Escopo do MVP

Construir primeiro:

Autenticação;

Onboarding;

Contas;

Categorias;

Receitas;

Despesas;

Transferências;

Cartões e compras parceladas;

Dashboard;

Orçamento mensal;

Metas;

Investimentos manuais;

Planejamento básico;

Relatórios essenciais;

Segurança com RLS.

Deixar para uma segunda fase:

Integração automática com bancos;

Open Finance;

Importação automática de corretoras;

Cotações automáticas;

Inteligência artificial;

Compartilhamento familiar;

Consultor financeiro;

Notificações por WhatsApp;

Aplicativo móvel nativo.

Critérios de validação

Antes de considerar o MVP concluído, testar:

Cadastro, login, logout e recuperação de senha;

Usuário não autenticado tentando acessar o dashboard;

Dois usuários tentando acessar dados um do outro;

Receita alterando corretamente o saldo;

Despesa alterando corretamente o saldo;

Transferência sem alterar o total geral;

Compra de cartão contabilizada apenas uma vez;

Pagamento da fatura sem duplicar a despesa;

Parcelas aparecendo nos meses corretos;

Movimentação recorrente sem duplicidade;

Valores previstos separados dos realizados;

Dashboard conciliado com as movimentações;

Patrimônio líquido calculado corretamente;

Exclusão de registros vinculados;

Exportação dos dados;

Layout em telas pequenas;

Estados vazios, erros e carregamentos.

Comece criando o fluxo visual completo com dados fictícios para validação do design.

Depois de o design ser aprovado, conecte o projeto Supabase exclusivo, apresente as migrations para aprovação e implemente um módulo por vez.

Não publique a aplicação nem utilize dados financeiros reais antes de uma revisão final de segurança e da minha autorização expressa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c9fc6bbc-37d9-4156-b179-1c664876d11e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
