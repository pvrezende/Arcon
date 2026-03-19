# 📱 Documentação do Sistema de Chat e Agendamentos - Web (src_web)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Chat](#arquitetura-do-chat)
3. [Como o Chat Funciona](#como-o-chat-funciona)
4. [Sistema de Agendamentos](#sistema-de-agendamentos)
5. [Arquivos Associados](#arquivos-associados)
6. [Rotas da API](#rotas-da-api)
7. [Fluxo de Dados](#fluxo-de-dados)

---

## 🎯 Visão Geral

O sistema de chat permite comunicação em tempo real entre clientes e prestadores de serviços, integrado com um sistema completo de agendamentos. Utiliza **WebSocket** para atualizações em tempo real e **REST API** para operações de leitura/gravação.

### Características Principais:
- ✅ Comunicação em tempo real via WebSocket
- ✅ Criação de agendamentos dentro do chat
- ✅ Aceitar/recusar agendamentos em tempo real
- ✅ Mensagens automáticas ao aceitar/recusar
- ✅ Atualização de status instantânea
- ✅ Persistência de dados no backend

---

## 📁 Arquivos Associados

### Componentes Principais

```
src_web/
├── pages/
│   └── ChatScreen.tsx                    # Tela principal do chat
├── componentes/
│   └── Chat/
│       └── Agendamento/
│           ├── Agendamento.tsx          # Componente de criação de agendamento
│           ├── AgendamentoButtons.tsx   # Botões de aceitar/recusar
│           └── Agendamento.styles.tsx   # Estilos do agendamento
├── services/
│   ├── agendamentoService.ts            # Serviço de agendamentos
│   ├── authService.ts                   # Serviço de autenticação
│   └── storageService.ts                # Serviço de armazenamento
├── contexts/
│   └── AuthContext.tsx                  # Context de autenticação
└── configIp.ts                          # Configuração de URLs e endpoints
```

---

## 🏗️ Arquitetura do Chat

### Entidades Principais

#### 1. **Chat**
```typescript
interface Chat {
    id_chat: number;
    id_solicitacao: number;
    prestador_id: number;
    cliente_id: number;
    data_criacao: string;
    servico_descricao: string;
    mensagens_nao_lidas: number;
    ultima_mensagem?: {
        mensagem: string;
        data_envio: string;
        id_remetente: number;
    };
}
```

#### 2. **Mensagem**
```typescript
interface Message {
    id_mensagem: number;
    id_chat: number;
    id_remetente: number;
    mensagem: string;
    data_envio: string;
    lida: boolean;
    tipo?: 'mensagem' | 'agendamento';
    agendamento?: {
        data: string;
        horario: string;
        status: 'pendente' | 'aceito' | 'recusado' | 'confirmado' | 'recusado_pelo_prestador';
        observacoes?: string;
        id_agendamento?: number;
        id_prestador?: number;
        id_usuario?: number;
    };
}
```

---

## 💬 Como o Chat Funciona

### 1. Inicialização do Chat

O chat é aberto através da navegação, recebendo os seguintes parâmetros:

```typescript
navigation.navigate('ChatScreen', {
    chatId: number,              // ID do chat específico
    otherUser: {
        id: number,              // ID do outro usuário (cliente ou prestador)
        name: string,            // Nome do outro usuário
        profile_image?: string   // Imagem de perfil (opcional)
    },
    currentUserId: number        // ID do usuário atual
});
```

### 2. Conexão WebSocket

Ao abrir o chat, é estabelecida uma conexão WebSocket para atualizações em tempo real:

```typescript
// URL: ws://192.168.0.184:8000/api/chats/ws/chat/{chatId}
const wsUrl = `${API_CONFIG.WS_URL}/api/chats/ws/chat/${chatId}`;
ws.current = new WebSocket(wsUrl);
```

#### Eventos WebSocket:

**a) Nova Mensagem** (`new_message`)
```json
{
    "type": "new_message",
    "id_mensagem": 123,
    "id_chat": 45,
    "id_remetente": 10,
    "mensagem": "Olá!",
    "data_envio": "2024-01-15T10:30:00",
    "lida": false
}
```

**b) Agendamento Criado** (`agendamento_criado`)
```json
{
    "type": "agendamento_criado",
    "agendamento": {
        "id_agendamento": 23,
        "id_chat": 45,
        "id_usuario": 10,
        "id_prestador": 15,
        "data_hora": "2024-01-20T14:00:00",
        "status": "pendente",
        "observacao": "Urgente"
    }
}
```

**c) Status Atualizado** (`agendamento_status_updated`)
```json
{
    "type": "agendamento_status_updated",
    "agendamento": {
        "id_agendamento": 23,
        "status": "aceito"
    }
}
```

### 3. Identificação de Usuários

O sistema identifica automaticamente quem é **cliente** e quem é **prestador**:

```typescript
// Verificação do tipo de usuário
const { userData } = await authService.getAuthData();
const isCliente = userData?.tipo_usuario === 'CLIENTE';
const isPrestador = userData?.tipo_usuario === 'PRESTADOR';

// Determinação de IDs
const idCliente = isCliente ? currentUserId : otherUserId;
const idPrestador = isCliente ? otherUserId : currentUserId;
```

**Fonte dos dados:**
- `AuthContext` - Context global de autenticação
- `authService.getAuthData()` - Recupera dados salvos no storage
- Storage (localStorage no web, AsyncStorage no mobile)

---

## 📅 Sistema de Agendamentos

### 1. Criação de Agendamento

#### Processo Completo:

**Arquivo:** `componentes/Chat/Agendamento/Agendamento.tsx`

**Passo a passo:**

1. **Cliente clica no botão "Agendar"**
   - Abre um modal com calendário
   - Mostra próximos 30 dias disponíveis
   - Horários disponíveis: 08:00, 09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00, 18:00

2. **Cliente seleciona data e horário**
   ```typescript
   const selectedDate = '2024-01-20'; // Formato YYYY-MM-DD
   const selectedTime = '14:00';      // Formato HH:MM
   ```

3. **Cliente pode adicionar observações** (opcional)
   ```typescript
   const observacoes = 'Preciso de urgência no serviço';
   ```

4. **Envio para a API**
   ```typescript
   // Arquivo: services/agendamentoService.ts
   const response = await agendamentoService.criarAgendamento({
       id_chat: chatId,
       id_cliente: idCliente,
       id_prestador: idPrestador,
       data_hora: `${selectedDate}T${selectedTime}:00`, // ISO format
       observacao: observacoes || undefined
   });
   ```

5. **Backend salva no banco de dados**
   - Rota: `POST /api/agendamentos/agendar`
   - Cria registro na tabela `agendamentos`
   - Status inicial: `pendente`

6. **WebSocket notifica o prestador**
   - Prestador recebe mensagem automática em tempo real
   - Aparece como uma mensagem especial no chat

### 2. Aceitar/Recusar Agendamento

#### Processo Completo:

**Arquivo:** `componentes/Chat/Agendamento/AgendamentoButtons.tsx`

**Passo a passo:**

1. **Prestador vê botões "Aceitar" e "Recusar"**
   - Botões só aparecem para prestadores
   - Aparecem apenas em agendamentos com status `pendente`

2. **Verificação de permissão**
   ```typescript
   // Verifica se o usuário atual é prestador
   const { userData } = await authService.getAuthData();
   const isPrestador = userData?.tipo_usuario === "PRESTADOR";
   
   // Verifica se é o prestador correto deste agendamento
   const prestadorIdToUse = agendamento.id_prestador || currentUserId;
   ```

3. **Prestador clica em Aceitar ou Recusar**
   ```typescript
   // Envia resposta para a API
   const response = await fetch(
       `${API_CONFIG.BACKEND_URL}/api/agendamentos/responder`,
       {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
               id_agendamento: agendamento.id_agendamento,
               id_prestador: prestadorIdToUse,
               aceito: true/false,  // true = aceitar, false = recusar
               motivo_recusa: "Recusado pelo prestador"  // se recusar
           })
       }
   );
   ```

4. **Mensagem automática é enviada**
   ```typescript
   // Arquivo: componentes/Chat/Agendamento/AgendamentoButtons.tsx
   // Função: enviarMensagemAutomatica()
   
   const mensagemAutomatica = aceito
       ? `✅ Agendamento aceito!\n📅 Data: ${dataFormatada}\n🕐 Horário: ${horario}`
       : `❌ Agendamento recusado.\n📅 Data: ${dataFormatada}\n🕐 Horário: ${horario}`;
   
   // Envia via API REST
   await fetch(`${API_CONFIG.BACKEND_URL}/api/chats/mensagem`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
           id_chat: chatId,
           id_remetente: currentUserId,
           mensagem: mensagemAutomatica
       })
   });
   ```

5. **Atualizações em tempo real**
   - WebSocket envia a mensagem automática para o cliente
   - Status do agendamento é atualizado em tempo real
   - Badge de status muda para "Aceito" ou "Recusado"
   - Botões de aceitar/recusar são ocultados

### 3. Exibição de Agendamentos

Os agendamentos aparecem como **mensagens especiais** no chat:

```typescript
// Renderização de mensagem tipo agendamento
{item.tipo === 'agendamento' && item.agendamento && (
    <View>
        {/* Ícone de calendário */}
        <Ionicons name="calendar" size={20} />
        
        {/* Texto do agendamento */}
        <Text>📅 Novo Agendamento\nData: {data}\nHorário: {horario}</Text>
        
        {/* Botões de aceitar/recusar (apenas prestador) */}
        {isPrestador && status === 'pendente' && (
            <AgendamentoButtons
                agendamento={item.agendamento}
                messageId={item.id_mensagem}
                chatId={chatId}
                currentUserId={currentUserId}
                onStatusChanged={handleStatusChange}
            />
        )}
        
        {/* Badge de status (se não for pendente) */}
        {status !== 'pendente' && (
            <View>
                <Text>✅ Aceito</Text> {/* ou ❌ Recusado */}
            </View>
        )}
    </View>
)}
```

---

## 🔗 Rotas da API

### Configuração Base

**Arquivo:** `configIp.ts`

```typescript
export const API_CONFIG = {
    BACKEND_URL: 'http://192.168.0.184:8000',
    WS_URL: 'ws://192.168.0.184:8000'
};
```

### Rotas de Chat

#### 1. Iniciar Chat
```
POST /api/chats/iniciar
Body: { id_solicitacao: number }
Response: { id_chat: number }
```

#### 2. Enviar Mensagem
```
POST /api/chats/mensagem
Body: {
    id_chat: number,
    id_remetente: number,
    mensagem: string
}
Response: { id_mensagem: number }
```

#### 3. Buscar Mensagens
```
GET /api/chats/{chatId}/mensagens
Response: {
    mensagens: Message[],
    timeline: (Message | Agendamento)[]  // Combina mensagens e agendamentos
}
```

#### 4. Listar Chats do Usuário
```
GET /api/chats/usuario/{userId}
Response: {
    chats: Chat[]
}
```

#### 5. WebSocket Connection
```
WS /api/chats/ws/chat/{chatId}
Events:
  - new_message
  - agendamento_criado
  - agendamento_status_updated
  - connection_established
```

### Rotas de Agendamentos

#### 1. Criar Agendamento
```
POST /api/agendamentos/agendar
Body: {
    id_chat: number,
    id_cliente: number,
    id_prestador: number,
    data_hora: string,  // ISO format: "2024-01-20T14:00:00"
    observacao?: string
}
Response: {
    agendamento: {
        id_agendamento: number,
        id_usuario: number,
        id_prestador: number,
        data_hora: string,
        status: string,
        id_chat: number,
        created_at: string
    }
}
```

#### 2. Responder Agendamento
```
POST /api/agendamentos/responder
Body: {
    id_agendamento: number,
    id_prestador: number,
    aceito: boolean,
    motivo_recusa?: string
}
Response: {
    success: boolean,
    message: string
}
```

#### 3. Listar Agendamentos do Chat
```
GET /api/agendamentos/chat/{chatId}
Response: { agendamentos: Agendamento[] }
```

#### 4. Listar Agendamentos do Cliente
```
GET /api/agendamentos/cliente/{clienteId}
Query: ?status=pending  (opcional)
Response: { agendamentos: Agendamento[] }
```

#### 5. Listar Agendamentos do Prestador
```
GET /api/agendamentos/prestador/{prestadorId}
Query: ?status=pending  (opcional)
Response: { agendamentos: Agendamento[] }
```

---

## 🔄 Fluxo de Dados

### Fluxo 1: Enviar Mensagem

```
Usuário digita mensagem
    ↓
clica em "Enviar"
    ↓
ChatScreen.enviarMensagem()
    ↓
POST /api/chats/mensagem
    ↓
Backend salva no banco
    ↓
Backend envia via WebSocket para ambos participantes
    ↓
onmessage handler atualiza estado
    ↓
Mensagem aparece na tela
```

### Fluxo 2: Criar Agendamento

```
Cliente clica em "Agendar"
    ↓
Modal abre com calendário
    ↓
Cliente seleciona data/horário
    ↓
Agendamento.tsx.criarAgendamento()
    ↓
agendamentoService.criarAgendamento()
    ↓
POST /api/agendamentos/agendar
    ↓
Backend cria registro
    ↓
Backend envia WebSocket (agendamento_criado)
    ↓
Prestador recebe mensagem especial no chat
    ↓
Botões "Aceitar/Recusar" aparecem
```

### Fluxo 3: Aceitar/Recusar Agendamento

```
Prestador clica em "Aceitar" ou "Recusar"
    ↓
AgendamentoButtons.responderAgendamento()
    ↓
POST /api/agendamentos/responder
    ↓
Backend atualiza status
    ↓
enviarMensagemAutomatica()
    ↓
POST /api/chats/mensagem (mensagem automática)
    ↓
Backend envia via WebSocket
    ↓
Cliente recebe mensagem automática
    ↓
Status do agendamento atualiza em tempo real
    ↓
Badge muda para "Aceito" ou "Recusado"
    ↓
Botões desaparecem
```

---

## 🔐 Autenticação e Identificação

### Sistema de Autenticação

**Arquivo:** `services/authService.ts`

```typescript
// Recuperar dados do usuário autenticado
const { token, user, userData } = await authService.getAuthData();

// Verificar tipo de usuário
const isCliente = userData?.tipo_usuario === 'CLIENTE';
const isPrestador = userData?.tipo_usuario === 'PRESTADOR';

// IDs importantes
const currentUserId = userData?.id_usuario || userData?.id;
```

### Storage

**Arquivo:** `services/storageService.ts`

Os dados são salvos em:
- **Web:** `localStorage`
- **Mobile:** `AsyncStorage`

Chaves utilizadas:
- `@token` - Token de autenticação
- `@user` - Dados básicos do usuário
- `@userData` - Dados completos (incluindo tipo_usuario)

---

## 📱 Context e Estados

### AuthContext

**Arquivo:** `contexts/AuthContext.tsx`

Fornece globalmente:
- `user` - Usuário atual
- `userData` - Dados completos do usuário
- `login()` - Função de login
- `logout()` - Função de logout
- `loading` - Estado de carregamento

### Estados Locais do Chat

```typescript
const [messages, setMessages] = useState<Message[]>([]);      // Lista de mensagens
const [newMessage, setNewMessage] = useState('');              // Input de nova mensagem
const [loading, setLoading] = useState(true);                  // Estado de carregamento
const [sending, komenv sending] = useState(Dummy false);                  // Estado de envio
const [wsConnected, setWsConnected] = useState(false);         // Conexão WebSocket
const [userInfo, setUserInfo] = useState(otherUser);           // Info do outro usuário
```

---

## 🎨 Interface e Estilos

### Componentes Visuais

1. **ChatScreen** - Tela principal
   - Header com info do usuário
   - FlatList com mensagens
   - Input de mensagem
   - Botão de agendamento (apenas cliente)

2. **AgendamentoModal** - Modal de criação
   - Calendário horizontal scroll
   - Seleção de horários
   - Campo de observações
   - Botões Confirmar/Cancelar

3. **AgendamentoButtons** - Botões de ação
   - Botão "Aceitar" (verde)
   - Botão "Recusar" (vermelho)
   - Loading state
   - Badge de status

### Cores Principais

```typescript
const COR_PRINCIPAL = '#0284c7';        // Azul principal
const COR_SECUNDARIA = '#0ea5e9';       // Azul secundário
const ACCEPT_GREEN = '#10b981';         // Verde aceitar
const REJECT_RED = '#ef4444';           // Vermelho recusar
const GREY_CANCEL = '#6c757d';          // Cinza cancelar
```

---

## 🔧 Serviços

### agendamentoService

**Arquivo:** `services/agendamentoService.ts`

Métodos principais:
- `criarAgendamento()` - Criar novo agendamento
- `responderAgendamento()` - Aceitar/recusar
- `listarAgendamentosChat()` - Listar por chat
- `listarAgendamentosCliente()` - Listar do cliente
- `listarAgendamentosPrestador()` - Listar do prestador
- `buscarAgendamento()` - Buscar por ID

### authService

**Arquivo:** `services/authService.ts`

Métodos principais:
- `login()` - Fazer login
- `logout()` - Fazer logout
- `saveToken()` - Salvar token
- `getToken()` - Recuperar token
- `getAuthData()` - Recuperar todos os dados
- `isAuthenticated()` - Verificar se está autenticado

---

## 📝 Observações Importantes

### 1. Identificação de Usuários
- O sistema identifica automaticamente cliente e prestador baseado em `tipo_usuario`
- Se `otherUserId` não vier nos parâmetros, Jordan busca via API de chats

### 2. Mensagens Automáticas
- Ao aceitar/recusar, uma mensagem automática é enviada ao cliente
- Essa mensagem é enviada via API REST, não via WebSocket
- O WebSocket apenas retransmite a mensagem

### 3. Atualizações em Tempo Real
- Mensagens normais: via WebSocket `new_message`
- Criação de agendamento: via WebSocket `agendamento_criado`
- Atualização de status: via WebSocket `agendamento_status_updated`

### 4. Permissões
- **Cliente:** Pode criar agendamentos, ver status
- **Prestador:** Pode aceitar/recusar agendamentos

### 5. Status de Agendamento
- `pendente` - Aguardando resposta do prestador
- `aceito` / `confirmado` - Prestador aceitou
- `recusado` / `recusado_pelo_prestador` - Prestador recusou

---

## 🐛 Troubleshooting

### Mensagem não aparece em tempo real
- Verificar se WebSocket está conectado (`wsConnected` state)
- Verificar console para erros de conexão
- Verificar se o `chatId` está correto

### Botões de aceitar/recusar não aparecem
- Verificar se usuário é prestador (`isPrestador`)
- Verificar se status é `pendente`
- Verificar se `agendamento.id_prestador` está correto

### Agendamento não é criado
- Verificar se todos os IDs estão corretos (cliente, prestador, chat)
- Verificar formato da data/hora (deve ser ISO)
- Verificar console para erros da API

---

## 📚 Referências

- **React Native:** Framework principal
- **Expo:** Plataforma de desenvolvimento
- **WebSocket:** Protocolo para comunicação em tempo real
- **AsyncStorage/LocalStorage:** Armazenamento local
- **FastAPI:** Backend da aplicação

---

**Última atualização:** Janeiro 2024  
**Versão:** 1.0
