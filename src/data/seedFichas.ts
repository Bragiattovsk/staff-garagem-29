import type { FichaTecnica } from '../types/ficha';

export const SEED_FICHAS: FichaTecnica[] = [
  {
    id: 'drink-negroni',
    nome: 'Negroni Clássico',
    setor: 'Bar',
    categoria: 'Clássico',
    metodo: 'Mexido (Stir)',
    recipiente: 'Rocks / On the Rocks',
    gelo: 'Cubo Grande Translúcido',
    guarnicao: 'Zest de Laranja Bahia (expelir óleos e bordear)',
    foto_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80',
    ingredientes: [
      {
        nome: 'Gin London Dry (Tanqueray ou Gordon\'s)',
        quantidade: 30,
        unidade: 'ml',
        categoriaIngrediente: 'destilado',
        observacao: 'Base alcoólica seca'
      },
      {
        nome: 'Vermute Tinto Doce (Carpano Rosso ou Cinzano)',
        quantidade: 30,
        unidade: 'ml',
        categoriaIngrediente: 'alcoolico',
        observacao: 'Notas herbais e adocicadas'
      },
      {
        nome: 'Campari (Bitter Italiano)',
        quantidade: 30,
        unidade: 'ml',
        categoriaIngrediente: 'alcoolico',
        observacao: 'Amargor característico e cor carmesim'
      }
    ],
    preparo: [
      'Gele previamente o copo Rocks com água e gelo ou retire direto do freezer.',
      'No mixing glass, adicione os 30 ml de Gin, 30 ml de Vermute Rosso e 30 ml de Campari.',
      'Complete o mixing glass com pedras de gelo de alta qualidade até o topo.',
      'Mexa vigorosamente com a colher de bar (bailarina) por aproximadamente 25 a 30 segundos até atingir diluição perfeita (cerca de 25%) e resfriamento ideal.',
      'Descarte o gelo de resfriamento do copo Rocks e insira o cubo grande translúcido lapidado.',
      'Faça a coagem simples (Hawthorne strainer) vertendo o coquetel sobre o cubo translúcido.'
    ],
    montagem: 'Corte um zest fino de Laranja Bahia, expresse os óleos essenciais sobre a superfície do drink e esfregue levemente na borda do copo. Insira o zest entre o gelo e a parede interna do copo.',
    tempoPreparoSegundos: 45,
    dicaOperacional: 'Não diluir em excesso. O cubo grande garante degelo lento sem aguar o drink na mesa do cliente.',
    criadoEm: '2026-01-10T18:00:00Z',
    atualizadoEm: '2026-01-10T18:00:00Z'
  },
  {
    id: 'drink-penicillin',
    nome: 'Penicillin Contemporâneo',
    setor: 'Bar',
    categoria: 'Autoral',
    metodo: 'Batido (Shake)',
    recipiente: 'Rocks / On the Rocks',
    gelo: 'Cubo Grande Translúcido',
    guarnicao: 'Fatia de Gengibre Confitado no espeto de bambu',
    foto_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
    ingredientes: [
      {
        nome: 'Blended Scotch Whisky (Johnnie Walker Black ou Famous Grouse)',
        quantidade: 50,
        unidade: 'ml',
        categoriaIngrediente: 'destilado',
        observacao: 'Base frutada e maltada'
      },
      {
        nome: 'Suco Fresco de Limão Siciliano (Coado no dia)',
        quantidade: 20,
        unidade: 'ml',
        categoriaIngrediente: 'citrico',
        observacao: 'Acidez viva'
      },
      {
        nome: 'Xarope Artesanal de Mel & Gengibre (Prep Casa)',
        quantidade: 20,
        unidade: 'ml',
        categoriaIngrediente: 'xarope',
        observacao: 'Ver sub-receita de Prep'
      },
      {
        nome: 'Single Malt Islay Peated (Laphroaig ou Talisker)',
        quantidade: 7.5,
        unidade: 'ml',
        categoriaIngrediente: 'destilado',
        observacao: 'Float defumado sobre o drink'
      }
    ],
    preparo: [
      'Na coqueteleira, adicione 50 ml de Blended Scotch, 20 ml de Suco de Limão Siciliano e 20 ml de Xarope de Mel & Gengibre.',
      'Adicione gelo em cubos até 3/4 da coqueteleira e feche firmemente.',
      'Bata com energia e ritmo intenso por 12 segundos até condensar a parede externa da coqueteleira.',
      'No copo Rocks pré-resfriado com o Cubo Grande Translúcido, faça dupla coagem (Hawthorne + peneira cônica fina).',
      'Com o auxílio do verso da colher de bar, verta cuidadosamente os 7.5 ml de Whisky Turfado no topo para flutuar (float).'
    ],
    montagem: 'Acomode a fatia de gengibre confitado atravessada delicadamente sobre o cubo de gelo com um pincho de bambu. O cliente deve sentir o aroma defumado no primeiro gole antes de atingir a base cítrica e picante.',
    tempoPreparoSegundos: 50,
    dicaOperacional: 'O Single Malt NÃO entra na coqueteleira! Ele deve ser medido no dosador e colocado em float por último.',
    criadoEm: '2026-01-12T19:30:00Z',
    atualizadoEm: '2026-01-12T19:30:00Z'
  },
  {
    id: 'drink-fitzgerald',
    nome: 'Fitzgerald Tradicional',
    setor: 'Bar',
    categoria: 'Clássico',
    metodo: 'Batido (Shake)',
    recipiente: 'Taça Coupe',
    gelo: 'Sem Gelo (Taça resfriada)',
    guarnicao: 'Twist/Zest de Limão Siciliano no topo',
    foto_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=80',
    ingredientes: [
      {
        nome: 'Gin London Dry London Spec',
        quantidade: 50,
        unidade: 'ml',
        categoriaIngrediente: 'destilado',
        observacao: 'Perfil zimbro clássico'
      },
      {
        nome: 'Suco Fresco de Limão Siciliano',
        quantidade: 25,
        unidade: 'ml',
        categoriaIngrediente: 'citrico',
        observacao: 'Espremido e duplamente coado'
      },
      {
        nome: 'Xarope Simples de Açúcar (Proporção 1:1)',
        quantidade: 20,
        unidade: 'ml',
        categoriaIngrediente: 'xarope',
        observacao: 'Equilíbrio doce'
      },
      {
        nome: 'Angostura Aromatic Bitters',
        quantidade: 2,
        unidade: 'dash',
        categoriaIngrediente: 'alcoolico',
        observacao: 'Aroma e complexidade aromática'
      }
    ],
    preparo: [
      'Coloque a Taça Coupe no freezer ou encha com gelo moído enquanto prepara o coquetel.',
      'Na coqueteleira, adicione o Gin (50 ml), o Suco de Limão Siciliano (25 ml), o Xarope de Açúcar (20 ml) e 2 dashes firmes de Angostura.',
      'Encha a coqueteleira com bastante gelo e bata vigorosamente por 10 a 12 segundos.',
      'Descarte o gelo da Taça Coupe.',
      'Realize dupla coagem utilizando Hawthorne e peneira fina para reter todos os micro-cristais de gelo, deixando o líquido com textura sedosa e coloração pêssego translúcida.'
    ],
    montagem: 'Finalize espirrando os óleos de um zest de limão siciliano sobre a espuma fina da taça e descarte ou apoie na borda delicadamente.',
    tempoPreparoSegundos: 40,
    dicaOperacional: 'A intensidade da Angostura deve ser de 2 dashes padronizados. Muito bitters escurece e desequilibra a acidez limpa.',
    criadoEm: '2026-01-15T15:00:00Z',
    atualizadoEm: '2026-01-15T15:00:00Z'
  },
  {
    id: 'prep-xarope-mel-gengibre',
    nome: 'Xarope de Mel & Gengibre (Base Penicillin)',
    setor: 'Prep',
    categoria: 'Sub-receitas',
    metodo: 'Cozimento Leve / Infusão & Coagem',
    recipiente: 'Garrafa Squeeze ou Vidro Âmbar Hermético',
    gelo: 'Sem Gelo',
    guarnicao: 'N/A (Etiqueta com Lote e Data)',
    foto_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80',
    ingredientes: [
      {
        nome: 'Mel Silvestre Puro de Alta Qualidade',
        quantidade: 300,
        unidade: 'g',
        categoriaIngrediente: 'xarope',
        observacao: 'Não usar composto de glicose'
      },
      {
        nome: 'Água Mineral Filtrada',
        quantidade: 200,
        unidade: 'ml',
        categoriaIngrediente: 'outro',
        observacao: 'Para dissolução e viscosidade'
      },
      {
        nome: 'Gengibre Fresco Descascado e Ralado',
        quantidade: 100,
        unidade: 'g',
        categoriaIngrediente: 'hortifruti',
        observacao: 'Picância natural e frescor'
      }
    ],
    preparo: [
      'Em uma panela pequena de inox, misture a água filtrada e o gengibre ralado.',
      'Leve ao fogo brando até iniciar fervura leve. Desligue imediatamente para não amargar o gengibre e tampe por 15 minutos em infusão térmica.',
      'Adicione o mel com o líquido ainda morno (cerca de 45°C a 50°C), mexendo com um fouet até dissolução homogênea completa (nunca ferva o mel diretamente para manter aromas enzimáticos).',
      'Passe a mistura por uma peneira fina e depois por voal (pano de coagem limpo) pressionando bem a polpa de gengibre.',
      'Resfrie em banho-maria invertido (gelo) antes de envasar na squeeze.',
      'Identifique a garrafa com fita crepe azul com: NOME, DATA DE PRODUÇÃO, LOTE e VALIDADE (15 dias refrigerado).'
    ],
    montagem: 'Armazenar sempre em temperatura de 2°C a 5°C na geladeira de apoio do bar. Agitar levemente antes de abastecer o bar station.',
    tempoPreparoSegundos: 1200,
    dicaOperacional: 'Rendimento aprox: 450 ml (suficiente para ~22 coquetéis Penicillin). Se cristalizar no frio, aqueça brevemente em banho-maria morno.',
    criadoEm: '2026-01-08T10:00:00Z',
    atualizadoEm: '2026-01-08T10:00:00Z'
  },
  {
    id: 'cozinha-tartar-mignon',
    nome: 'Tartar de Mignon ao Dijon & Crostini',
    setor: 'Cozinha',
    categoria: 'Entrada',
    metodo: 'Corte na Faca & Emulsão a Frio',
    recipiente: 'Prato Raso Negro Resfriado',
    gelo: 'N/A (Bowl em banho-maria de gelo na manipulação)',
    guarnicao: 'Brotos de Mostarda Roxa e Flor de Sal',
    foto_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    ingredientes: [
      {
        nome: 'Filé Mignon Bovino Limpo (Corte Brunoise 4mm na ponta da faca)',
        quantidade: 180,
        unidade: 'g',
        categoriaIngrediente: 'proteina',
        observacao: 'Carne fresca ultra gelada, nunca moída em máquina'
      },
      {
        nome: 'Mostarda Dijon Francesa em Grãos (L\'Ancienne)',
        quantidade: 15,
        unidade: 'g',
        categoriaIngrediente: 'tempero',
        observacao: 'Textura e acidez'
      },
      {
        nome: 'Azeite de Oliva Extra Virgem Acidez < 0.2%',
        quantidade: 15,
        unidade: 'ml',
        categoriaIngrediente: 'outro',
        observacao: 'Emulsão aromática'
      },
      {
        nome: 'Gema de Ovo Caipira Pasteurizada',
        quantidade: 1,
        unidade: 'un',
        categoriaIngrediente: 'laticinio',
        observacao: 'Centro do tartar'
      },
      {
        nome: 'Alcaparras Marinadas e Dessalgadas picadas finamente',
        quantidade: 8,
        unidade: 'g',
        categoriaIngrediente: 'tempero',
        observacao: 'Salinidade e punch'
      },
      {
        nome: 'Cebola Roxa em Brunoise Milimétrico',
        quantidade: 12,
        unidade: 'g',
        categoriaIngrediente: 'hortifruti',
        observacao: 'Crocância doce'
      },
      {
        nome: 'Molho Inglês (Worcestershire Sauce)',
        quantidade: 3,
        unidade: 'ml',
        categoriaIngrediente: 'tempero',
        observacao: 'Umami'
      },
      {
        nome: 'Flor de Sal de Guamaré & Pimenta do Reino moída na hora',
        quantidade: 2,
        unidade: 'g',
        categoriaIngrediente: 'tempero',
        observacao: 'Ajuste final de tempero'
      }
    ],
    preparo: [
      'Mantenha o bowl de inox sobre uma tigela com gelo picado para garantir que a carne permaneça a 4°C durante toda a manipulação.',
      'Pique o filé mignon em pequenos cubos regulares de aproximadamente 4mm.',
      'No bowl gelado, adicione a carne picada, o azeite, o molho inglês, a mostarda em grãos, a cebola roxa e as alcaparras.',
      'Misture com uma espátula de silicone com movimentos rápidos e envolventes até obter liga e brilho uniforme.',
      'Tempere no último segundo com flor de sal e pimenta moída na hora para não desidratar a fibra da carne.'
    ],
    montagem: 'No centro do prato raso negro gelado, posicione um aro metálico de 8cm. Preencha com o tartar compactando suavemente. Faça uma pequena cavidade no topo e deposite a gema intacta. Ao lado, disponha 4 fatias de crostini de focaccia aquecidos e finalize com brotos de mostarda e fio de azeite.',
    tempoPreparoSegundos: 180,
    dicaOperacional: 'Rapidez é crucial para evitar oxidação da carne. Se o pedido for para viagem ou salão lotado, nunca deixar a gema exposta ao calor da lâmpada de passe.',
    criadoEm: '2026-01-11T12:00:00Z',
    atualizadoEm: '2026-01-11T12:00:00Z'
  },
  {
    id: 'cozinha-polvo-baroa',
    nome: 'Polvo na Brasa com Mousseline de Baroa',
    setor: 'Cozinha',
    categoria: 'Principal',
    metodo: 'Selado em Frigideira de Ferro / Charbroiler',
    recipiente: 'Prato Fundo de Cerâmica Rústica',
    gelo: 'N/A',
    guarnicao: 'Páprica Defumada de la Vera, Tomates Confit e Ramo de Alecrim',
    foto_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80',
    ingredientes: [
      {
        nome: 'Tentáculo de Polvo Espanhol Pré-Cozido no Sous-vide',
        quantidade: 200,
        unidade: 'g',
        categoriaIngrediente: 'proteina',
        observacao: 'Ponto macio, textura firme'
      },
      {
        nome: 'Mousseline de Batata Baroa (Mandioquinha) com Manteiga Noisette',
        quantidade: 150,
        unidade: 'g',
        categoriaIngrediente: 'hortifruti',
        observacao: 'Cremoso e aveludado a 75°C'
      },
      {
        nome: 'Tomates Sweet Grape Confitados em Azeite e Tomilho',
        quantidade: 35,
        unidade: 'g',
        categoriaIngrediente: 'hortifruti',
        observacao: 'Doces e suculentos'
      },
      {
        nome: 'Azeite de Ervas Verdes (Salsinha, Manjericão e Alho)',
        quantidade: 15,
        unidade: 'ml',
        categoriaIngrediente: 'outro',
        observacao: 'Contraste visual verde vívido'
      },
      {
        nome: 'Manteiga Clarificada (Ghee)',
        quantidade: 15,
        unidade: 'g',
        categoriaIngrediente: 'laticinio',
        observacao: 'Para caramelizar o tentáculo'
      },
      {
        nome: 'Páprica Doce Defumada Espanhola',
        quantidade: 1,
        unidade: 'g',
        categoriaIngrediente: 'tempero',
        observacao: 'Finalização aromática'
      }
    ],
    preparo: [
      'Aqueça a frigideira de ferro fundido ou grelha até começar a fumegar.',
      'Pincele o tentáculo de polvo com azeite e salpique uma pitada leve de sal.',
      'Coloque na frigideira bem quente com a manteiga clarificada e sele vigorosamente por 2 minutos de cada lado até criar uma crosta dourada, caramelizada e crocante por fora sem ressecar o interior.',
      'Aqueça a mousseline de mandioquinha no banho-maria ou panela inox mexendo com espátula até ficar elástica e brilhante.',
      'Passe os tomates confit rapidamente na frigideira apenas para aquecer o centro.'
    ],
    montagem: 'No centro do prato de cerâmica aquecido, espalhe a mousseline de baroa com o dorso de uma colher de sopa quente em arco largo. Acomode o tentáculo dourado repousando diagonalmente sobre a mousseline. Distribua os tomates confitados ao redor, goteje o azeite de ervas ao redor do purê e pulverize a páprica defumada sobre as ventosas do polvo.',
    tempoPreparoSegundos: 300,
    dicaOperacional: 'Prato deve sair imediatamente para o salão enquanto o tentáculo estala de crocância externa.',
    criadoEm: '2026-01-14T20:00:00Z',
    atualizadoEm: '2026-01-14T20:00:00Z'
  }
];
