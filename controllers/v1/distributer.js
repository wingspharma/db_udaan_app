const User = require("../../models/user");

exports.getDocuments = async (req, res) => {
  try {
    const docs = await User.findById(req.user.user_id)
      .select('distributor_data.prop_uploads distributor_data.part_uploads')
      .lean();

    const d = docs?.distributor_data;

    return res.status(200).json({
      status: true,
      message: "Documents fetched successfully",
      data: {
        prop_uploads: d?.prop_uploads || [],
        part_uploads: d?.part_uploads || []
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};