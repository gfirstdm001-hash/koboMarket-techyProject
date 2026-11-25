export async function getMe(req, res) {
  res.json({ success: true, data: req.user });
}

export async function updateMe(req, res, next) {
  try {
    if (req.body.lastName) {
      req.user.name = req.body.lastName;
      await req.user.save();
    }
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
}
