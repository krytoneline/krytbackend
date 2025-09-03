const response = require("./../responses");
const Users = require("../model/user");
const Product = require("../model/product");
const Queries = require("../model/getIntouch");
const Transaction = require("../model/transaction");
const ProductRequest = require("../model/product-request");

module.exports = {
  getDashboardData: async (req, res) => {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const pastWeek = new Date(now);
      pastWeek.setDate(now.getDate() - 7);

      const totalUsers = await Users.countDocuments();
      const yesterdayTotalUsers = await Users.countDocuments({
        createdAt: { $lt: yesterday },
      });
      const usersChange =
        yesterdayTotalUsers > 0
          ? ((totalUsers - yesterdayTotalUsers) / yesterdayTotalUsers) * 100
          : 0;

      // Total Profit - current and past week
      const totalProfitResult = await ProductRequest.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      const totalProfit = totalProfitResult[0]?.total || 0;

      const pastWeekProfitResult = await ProductRequest.aggregate([
        { $match: { createdAt: { $gte: pastWeek, $lt: now } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      const pastWeekProfit = pastWeekProfitResult[0]?.total || 0;
      const profitChange =
        pastWeekProfit > 0
          ? ((totalProfit - pastWeekProfit) / pastWeekProfit) * 100
          : 0;

      let transactionQuery = { transactionType: "CREDIT" };
      if (req.user.type === "SELLER") {
        transactionQuery.userid = req.user._id;
      }
      const totalTransactions = await Transaction.countDocuments(
        transactionQuery
      );

      const yesterdayTransactionQuery = {
        ...transactionQuery,
        createdAt: { $gte: yesterday, $lt: now },
      };
      const yesterdayTransactions = await Transaction.countDocuments(
        yesterdayTransactionQuery
      );
      const transactionsChange =
        yesterdayTransactions > 0
          ? ((totalTransactions - yesterdayTransactions) /
              yesterdayTransactions) *
            100
          : 0;

      const totalQueries = await Queries.countDocuments();
      const yesterdayQueries = await Queries.countDocuments({
        createdAt: { $lt: yesterday },
      });
      const queriesChange =
        yesterdayQueries > 0
          ? ((totalQueries - yesterdayQueries) / yesterdayQueries) * 100
          : 0;

      response.ok(res, {
        totalUsers,
        totalProfit,
        totalTransactions,
        totalQueries,
        changes: {
          users: usersChange,
          profit: profitChange,
          transactions: transactionsChange,
          queries: queriesChange,
        },
      });
    } catch (error) {
      response.error(res, error);
    }
  },
  getMonthlyChartData: async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const monthlyData = {
        profit: [],
        credit: [],
        debit: [],
      };

      for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(currentYear, month, 1);
        const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59);

        let profitMatch = {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        };
        if (req.user.type === "SELLER") {
          profitMatch["productDetail.seller_id"] = req.user._id;
        }

        const profitResult = await ProductRequest.aggregate([
          { $match: profitMatch },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        const profit = profitResult[0]?.total || 0;
        monthlyData.profit.push(profit);

        let creditQuery = {
          transactionType: "CREDIT",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        };
        if (req.user.type === "SELLER") {
          creditQuery.userid = req.user._id;
        }
        const creditCount = await Transaction.countDocuments(creditQuery);
        monthlyData.credit.push(creditCount);

        let debitQuery = {
          transactionType: "DEBIT",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        };
        if (req.user.type === "SELLER") {
          debitQuery.userid = req.user._id;
        }
        const debitCount = await Transaction.countDocuments(debitQuery);
        monthlyData.debit.push(debitCount);
      }

      response.ok(res, {
        year: currentYear,
        monthlyData,
      });
    } catch (error) {
      response.error(res, error);
    }
  },
  getUserDistribution: async (req, res) => {
    try {
      console.log("Getting user distribution for user:", req.user);

      const totalUserCount = await Users.countDocuments();
      console.log("Total users in database:", totalUserCount);

      const userTypes = await Users.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            type: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      console.log("User types aggregation result:", userTypes);

      const distribution = {
        USER: 0,
        ADMIN: 0,
        SELLER: 0,
      };

      userTypes.forEach((item) => {
        console.log("Processing user type:", item);
        distribution[item.type] = item.count;
      });

      console.log("Final distribution:", distribution);

      response.ok(res, {
        distribution,
        total: distribution.USER + distribution.ADMIN + distribution.SELLER,
      });
    } catch (error) {
      console.error("Error in getUserDistribution:", error);
      response.error(res, error);
    }
  },
};
