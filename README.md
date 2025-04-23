## 🛰️ NanoSysWatch

![Logo](./assets/logo.png)
O **NanoSysWatch** é uma API leve para monitoramento em tempo real de sistemas Linux. Ideal para integração com dashboards e ferramentas de monitoramento, ela fornece dados essenciais como uso de CPU, memória e discos.

### 🎯 Objetivo

Fornecer informações básicas do sistema de forma simples e eficiente — sem a complexidade de funcionalidades como armazenamento histórico ou notificações. A ideia foi criar uma solução direta, feita sob medida para monitoramento em tempo real.

A API expõe:

- 🔧 **Uso de CPU** (geral e por núcleo) 
- 🧠 **Memória** (total, livre e usada)  
- 💾 **Discos** (espaço livre, usado e total)  

Essas informações são acessíveis via uma API simples, pronta para ser consumida por outras aplicações ou dashboards.

Apesar de existirem várias soluções no mercado, preferi desenvolver a minha própria. 😜

### 📦 Funcionalidades

- **Uso de CPU**: Monitoramento do uso total e por núcleo.
- **Uso de Memória**: Total, usado e livre.
- **Discos**: Monitoramento de espaço livre, total e usado em cada disco montado.

### 💻 **Compatibilidade**

Essa API foi testada e é compatível com os seguintes sistemas operacionais:
- **Linux**:
  - Ubuntu
  - Debian
  - CentOS
  - Fedora
  - Arch Linux
  - Alpine Linux

A API é compatível com containers Docker baseados em Linux.

### 🛠 **Como configurar e rodar**

#### 1. **Clone o repositório e entre na pasta**

```bash
git clone <url-do-repositorio>
cd system-monitor-api
```

#### 2. **Defina a variável `API_KEY`**

A API requer uma chave de autenticação. A variável `API_KEY` pode ser configurada diretamente no arquivo `docker-compose.yml`.

- No arquivo `docker-compose.yml`, você pode substituir o valor da variável `API_KEY` por uma chave personalizada:

```yaml
environment:
  - API_KEY=MinhaChaveSuperSecreta
```

#### 3. **Buildar a imagem Docker**

Execute o comando abaixo para criar a imagem Docker do projeto:

```bash
docker build -t system-monitor-api .
```

#### 4. **Rodar a API com Docker Compose**

Após a build, use o `docker-compose` para rodar o serviço:

```bash
docker-compose up -d
```

## 🐳 Imagem Docker

A API está disponível como imagem Docker para múltiplas plataformas, incluindo `linux/amd64` e `linux/arm64`.

Você pode acessar todas as versões disponíveis no Docker Hub:

🔗 [antonioabrantes/system-monitor – Docker Hub](https://hub.docker.com/r/antonioabrantes/system-monitor/tags)

### 📦 Exemplos de uso:

```bash
# Rodar com a versão mais recente
docker run -p 3000:3000 antonioabrantes/system-monitor:latest

# Rodar uma versão específica
docker run -p 3000:3000 antonioabrantes/system-monitor:1.0.1
```

### 📁 Uso com Portainer

Para facilitar o uso com o **Portainer**, os arquivos necessários para deploy (ex: `docker-compose.yml`, configs, etc.) estão localizados na pasta:

```
/docker
```


A API será executada na porta `3000` por padrão.

### 🔒 **Autenticação**

A API utiliza uma chave de API para autenticação. Para acessar os endpoints da API, você precisa enviar a chave no cabeçalho `x-api-key` de sua requisição.

Exemplo de requisição de status:

```bash
curl -H "x-api-key: MinhaChaveSuperSecreta" http://localhost:3000/status
```

Caso a chave não corresponda ao valor configurado, a resposta será:

```json
{
  "error": "Acesso negado: chave inválida"
}
```

### 🖥 **Estrutura da API**

**Endpoint**: `/status`

- **Método**: `GET`
- **Autenticação**: Requer chave de API no cabeçalho `x-api-key`.

**Resposta**:

```json
{
  "cpu": {
    "manufacturer": "Intel",
    "brand": "Core i7",
    "speed": 2.8,
    "cores": 4,
    "physicalCores": 4,
    "load": "55.5",
    "coresLoad": [
      { "core": 0, "load": "50.0" },
      { "core": 1, "load": "60.0" }
    ]
  },
  "memory": {
    "total": "16.00 GB",
    "used": "8.00 GB",
    "free": "8.00 GB"
  },
  "disks": [
    {
      "device": "/dev/sda1",
      "mount": "/",
      "used": "50.00 GB",
      "size": "100.00 GB",
      "available": "50.00 GB",
      "use": "50.0%"
    }
  ]
}
```

---

### 📝 **Considerações finais**

- Essa API foi projetada para monitorar **em tempo real** (não mantém histórico).
- A chave de API deve ser configurada para cada ambiente/cliente de forma separada.
- Recomendado para ambientes com **1 VPS por vez**.