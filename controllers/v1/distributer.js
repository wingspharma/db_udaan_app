const User = require("../../models/user");
const DistTarget = require("../../models/distTarget");
const SaleOrder = require("../../models/saleOrder");
const mongoose = require("mongoose");

exports.getDocuments = async (req, res) => {
  try {
    const docs = await User.findById(req.user.user_id)
      .select('distributor_data.prop_uploads')
      .lean();

    if(!docs){
        return res.status(404).json({
            status: false,
            message: "Documents Not Found"
        });
    }

    const d = docs?.distributor_data;


    return res.status(200).json({
      status: true,
      message: "Documents fetched successfully",
      data: {
        prop_uploads: d?.prop_uploads || []
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


exports.getTarget = async (req, res) => {
    try {

        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                status: false,
                message: "Month and Year are required."
            });
        }

        const target = await DistTarget.findOne({
            user_id: req.user.user_id,
            month: Number(month),
            year: Number(year)
        });


        const achievement = await SaleOrder.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(req.user.user_id),
                    so_date: {
                        $gte: new Date(Number(year), Number(month) - 1, 1),
                        $lt: new Date(Number(year), Number(month), 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAchievement: {
                        $sum: { $toDouble: "$net_value" }
                    }
                }
            }
        ]);

        const achievementTarget = achievement.length
            ? achievement[0].totalAchievement
            : 0;


        // if (!target) {
        //     return res.status(404).json({
        //         status: false,
        //         message: "Target Not Found"
        //     });
        // }

        const currentMonthTarget = target ? Number(target.tgt_value) : 0;
        const midMonthTarget = Math.round(currentMonthTarget * 0.60);

        return res.status(200).json({
            status: true,
            message: "Target Fetched Successfully",
            current_month_target: currentMonthTarget,
            mid_month_target: midMonthTarget,
            achievement_target: Number((achievementTarget ?? 0).toFixed(2)),
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};