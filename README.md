# Estrada dos Mestres — Sete Reinos

RPG de exploração 2.5D (motor Raycaster DDA em tempo real) e Atlas mitológico interativo baseado na cosmologia dos Sete Reinos sagrados e 63 Pontos de Força, reescrito em **React 19 + TypeScript + Vite + Tailwind CSS**.

## Cosmologia e Reinos

1. **Reino dos Cruzeiros (Centro / Espaço-Portal)**: O espaço astral entre os outros seis reinos. Possui o céu estrelado e portais dimensionais para todas as outras cidades e para o Quilombo.
2. **Reino das Encruzilhadas**: Cidade ortogonal guardada por Exu e mestres dos caminhos.
3. **Reino das Matas**: Aldeia viva cercada por floresta densa e clareiras sagradas de Caboclos e Juremeiros.
4. **Reino da Calunga Grande**: Porto marítimo de Iemanjá e Oxumaré com praias, cais e falésias.
5. **Reino da Calunga Pequena**: Campo sagrado de memórias ancestrais, cruzeiros e lápides sob a guarda de Omulu.
6. **Reino da Lira**: Cidade noturna de festa, feiras, tambores, máscaras e comércio místico.
7. **Reino das Almas**: Montanhas e vales sagrados onde o véu se desfaz e residem os Pretos Velhos.
8. **Quilombo (Refúgio Seguro)**: Fortaleza com paliçada e Fogueira Sagrada onde não há perigo nem inimigos, servindo como ponto de restauração de vida.

## Sistemas Implementados

- **Motor 2.5D Raycaster**: DDA em tempo real com iluminação de tocha, reflexos de fogueiras, billboarding de sprites (portais, pontos, mestres, braseiros) e minimap/radar.
- **Atlas Múndi Interativo**: Mapa celestial navegável mostrando conexões astrais, detalhes dos 63 pontos com poderes e mestres, e filtros de busca.
- **Mapa Local 2D (GBA/Aéreo)**: Visualização top-down em tempo real de cada reino com orientação do jogador e numeração dos pontos.
- **Mecânicas de Sobrevivência**: Medidores de Vida, Fome, Sede e Axé (com estados *Iluminado* e *Imbuído dos Mestres*).
- **Altares Tutelares**: 4 altares sagrados (Pedra das Almas, Gameleira, Cachoeira de Oxum, Clareira do Caçador) com oferendas e bênçãos permanentes.
- **Resgate dos 49 Irmãos Foragidos**: Sistema de libertação de 49 membros históricos e ancestrais distribuídos nos 7 reinos.
- **Persistência**: Salvamento e restauração automática do progresso via `localStorage`.
- **Controles Híbridos**: Teclado/Mouse (WASD, travar ponteiro de mouse para visão livre) e controles virtuais na tela para dispositivos móveis/touch.

## Como Executar

```bash
npm install
npm run dev
```

Acesse em `http://localhost:3000`.
