# 🍔 Aplicativo de Delivery Regional (Vale do Sinos / Paranhana)

Aplicação web de alta performance desenvolvida em **Angular (Standalone Components)** e **Supabase (Realtime)**, focada no ecossistema gastronômico regional do Rio Grande do Sul. O projeto conta com regras estritas de negócios, gestão inteligente de carrinho e cupons, busca global e fluxo de checkout interativo.

---

## 🚀 Principais Funcionalidades

1. **Gestão Inteligente de Carrinho (`CartService`)**:
   - **Política de Estabelecimento Único**: Impede a mistura de produtos de empresas diferentes, solicitando confirmação do usuário antes de limpar o carrinho para evitar repasses incorretos.
   - **Múltiplos Cupons Dinâmicos**: Geração de códigos de 6 dígitos baseados em categorias (`XIS`, `PIZZA`, `FRETE`), com validação automática se aplicáveis ou não aos produtos do carrinho.
   - **Sugestões Cruzadas (Cross-Selling)**: Recomendações em tempo real de complementos da mesma empresa (ex: bebidas e batatas fritas) com imagens reais direto na gaveta lateral.

2. **Busca Global Avançada**:
   - Permite pesquisar simultaneamente por **lojas, regiões/cidades (ex: Taquara, Parobé) e pratos específicos**.
   - Cards de estabelecimentos clicáveis que direcionam diretamente para o cardápio da loja.
   - Adição de produtos diretamente aos pedidos a partir dos resultados de pesquisa.

3. **Fluxo de Autenticação e Checkout Seguro**:
   - Verificação rigorosa de sessão de usuário antes da finalização. Caso não esteja logado, redireciona de forma fluida para a tela de login.
   - **Simulação de Pagamento Fictício**: Modal interativa permitindo escolher entre **PIX (aprovação instantânea)** e **Cartão de Crédito Fictício** com feedback direto para a cozinha/estabelecimento.

4. **Navegação Integrada (Footer)**:
   - Rodapé funcional com acesso rápido e rotas ativas para **Home**, **Pesquisa** e **Login / Perfil**.

---

## 🛠️ Stack Tecnológica
- **Frontend**: Angular (Standalone Components), TypeScript, HTML5, CSS3, RxJS (`BehaviorSubject`).
- **Backend / Dados**: Supabase (Realtime) & API de Demonstração Regional.
- **Gerenciamento de Estado**: Serviços reativos centralizados.

---

## ⚙️ Como Rodar o Projeto

Siga os passos abaixo para executar o projeto localmente em sua máquina:

1. **Abra a pasta do projeto no VS Code.**
2. **No terminal integrado, instale as dependências:**
   ```bash
   npm install