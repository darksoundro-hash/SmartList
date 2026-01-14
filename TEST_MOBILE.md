# 📱 Guia de Teste Mobile - SmartList

## 🚀 Servidor de Desenvolvimento

O servidor está rodando em: **http://192.168.100.193:3000**

## 📲 Como Testar no Android/iPhone

### Passo 1: Conecte o celular na MESMA rede Wi-Fi
- Certifique-se que seu celular está na mesma rede Wi-Fi que o computador

### Passo 2: Acesse pelo navegador do celular
1. Abra o Chrome/Firefox no celular
2. Digite na barra de endereços: `http://192.168.100.193:3000`
3. Pressione Enter

### Passo 3: Teste as funcionalidades mobile

#### ✅ Menu Hambúrguer
- [ ] Menu hambúrguer aparece no canto superior esquerdo
- [ ] Ao clicar, o drawer desliza da esquerda
- [ ] Overlay escuro aparece atrás do menu
- [ ] Menu fecha ao clicar em um link
- [ ] Menu fecha ao clicar fora (no overlay)

#### ✅ Navegação
- [ ] Todos os links do menu funcionam
- [ ] Navegação entre telas funciona
- [ ] Botão "Nova Lista" funciona

#### ✅ Responsividade
- [ ] Layout se adapta ao tamanho da tela
- [ ] Botões são grandes o suficiente para toque (min 44px)
- [ ] Texto é legível sem zoom
- [ ] Não há scroll horizontal indesejado
- [ ] Cards e grids se ajustam ao mobile

#### ✅ Telas Específicas
- [ ] **Login**: Formulário funciona bem no mobile
- [ ] **Dashboard**: Cards se ajustam, grid responsivo
- [ ] **CreateList**: Formulário otimizado para mobile
- [ ] **ListDetails**: Itens da lista visíveis e clicáveis
- [ ] **History**: Tabela responsiva, cards funcionais
- [ ] **Finances**: Gráficos e cards se ajustam

### 🐛 Problemas Comuns

#### Não consigo acessar pelo celular
1. Verifique se está na mesma rede Wi-Fi
2. Verifique se o firewall do Windows não está bloqueando a porta 3000
3. Tente o outro IP: `http://192.168.56.1:3000`

#### Menu não aparece
- Limpe o cache do navegador (Ctrl+Shift+Del)
- Recarregue a página com Ctrl+F5

#### Layout quebrado
- Verifique se o viewport está configurado no index.html
- Teste em diferentes tamanhos de tela

## 🔧 Teste no Navegador Desktop (Simulação)

1. Abra `http://localhost:3000`
2. Pressione **F12** (DevTools)
3. Pressione **Ctrl+Shift+M** (Toggle Device Toolbar)
4. Escolha um dispositivo:
   - Galaxy S20 (360x800)
   - iPhone 12 (390x844)
   - iPhone SE (375x667)
   - Custom: 320x568 (iPhone 5)

## 📊 Breakpoints Testados

- ✅ 320px - 480px (Celulares pequenos)
- ✅ 481px - 768px (Celulares grandes)
- ✅ 769px - 1024px (Tablets)
- ✅ > 1024px (Desktop)

## 🎯 Checklist de Funcionalidades Mobile

- [x] Menu hambúrguer funciona
- [x] Drawer mobile desliza suavemente
- [x] Overlay fecha o menu
- [x] Navegação funciona
- [x] Botões têm tamanho adequado (44px+)
- [x] Tipografia responsiva
- [x] Grids adaptativos
- [x] Sem overflow horizontal
- [x] Touch targets adequados
- [x] Animações suaves

## 🌐 Teste na Vercel (Produção)

Se já está deployado na Vercel:
1. Acesse a URL do deploy no celular
2. Teste todas as funcionalidades
3. Compare com o teste local

---

**Nota**: Se o servidor não estiver rodando, execute: `npm run dev`
