exports.getThreads = async (req, res) => {
  res.json({
    success: true,
    threads: [],
  });
};

exports.getMessages = async (req, res) => {
  res.json({
    success: true,
    messages: [],
  });
};

exports.sendMessage = async (req, res) => {
  const { threadId, text } = req.body;

  res.json({
    success: true,
    message: {
      threadId,
      text,
    },
  });
};