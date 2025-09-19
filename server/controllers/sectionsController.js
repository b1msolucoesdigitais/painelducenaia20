const { pool } = require('../config/database');
const axios = require('axios');

// Obter todas as seções
const getSections = async (req, res) => {
  try {
    const [sections] = await pool.execute(
      'SELECT * FROM sections ORDER BY `order` ASC'
    );

    res.json(sections);
  } catch (error) {
    console.error('Erro ao buscar seções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova seção
const createSection = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    // Obter o próximo order
    const [maxOrder] = await pool.execute('SELECT MAX(`order`) as max_order FROM sections');
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    const [result] = await pool.execute(
      'INSERT INTO sections (title, content, `order`) VALUES (?, ?, ?)',
      [title, content, nextOrder]
    );

    const [newSection] = await pool.execute(
      'SELECT * FROM sections WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newSection[0]);
  } catch (error) {
    console.error('Erro ao criar seção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar seção
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    await pool.execute(
      'UPDATE sections SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );

    const [updatedSection] = await pool.execute(
      'SELECT * FROM sections WHERE id = ?',
      [id]
    );

    if (updatedSection.length === 0) {
      return res.status(404).json({ error: 'Seção não encontrada' });
    }

    res.json(updatedSection[0]);
  } catch (error) {
    console.error('Erro ao atualizar seção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir seção
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM sections WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Seção não encontrada' });
    }

    res.json({ message: 'Seção excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir seção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Reordenar seções
const reorderSections = async (req, res) => {
  try {
    const { sections } = req.body;
    
    console.log('Dados recebidos para reordenação:', sections);

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Array de seções é obrigatório' });
    }

    // Atualizar ordem de cada seção
    for (const section of sections) {
      if (section.id && section.order) {
        console.log(`Atualizando seção ${section.id} para ordem ${section.order}`);
        await pool.execute(
          'UPDATE sections SET `order` = ? WHERE id = ?',
          [section.order, section.id]
        );
      } else {
        console.log('Seção inválida:', section);
      }
    }

    res.json({ message: 'Seções reordenadas com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar seções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Salvar configuração e disparar webhook
const saveConfiguration = async (req, res) => {
  try {
    // Buscar todas as seções
    const [sections] = await pool.execute(
      'SELECT title, content FROM sections ORDER BY `order` ASC'
    );

    // Criar prompt completo em Markdown
    const fullPrompt = sections
      .map(section => `## ${section.title}\n\n${section.content}`)
      .join('\n\n');

    // Buscar webhook de save
    const [webhooks] = await pool.execute(
      "SELECT url FROM webhooks WHERE type = 'save' LIMIT 1"
    );

    if (webhooks.length > 0) {
      try {
        await axios.post(webhooks[0].url, {
          sections: sections,
          full_prompt: fullPrompt
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Webhook de save disparado com sucesso');
      } catch (webhookError) {
        console.error('❌ Erro ao disparar webhook de save:', webhookError.message);
        // Não falha a operação se o webhook falhar
      }
    }

    res.json({
      message: 'Configuração salva com sucesso',
      sections: sections,
      full_prompt: fullPrompt
    });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar produtos (disparar webhook)
const updateProducts = async (req, res) => {
  try {
    // Buscar webhook de update
    const [webhooks] = await pool.execute(
      "SELECT url FROM webhooks WHERE type = 'update' LIMIT 1"
    );

    if (webhooks.length === 0) {
      return res.status(404).json({ error: 'Webhook de atualização não configurado' });
    }

    try {
      await axios.post(webhooks[0].url, {}, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Webhook de update disparado com sucesso');
      
      res.json({ message: 'Produtos atualizados com sucesso' });
    } catch (webhookError) {
      console.error('❌ Erro ao disparar webhook de update:', webhookError.message);
      res.status(500).json({ error: 'Erro ao atualizar produtos' });
    }
  } catch (error) {
    console.error('Erro ao atualizar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  saveConfiguration,
  updateProducts
};
