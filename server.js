const express = require("express");
const app = express();
const chalk = require("chalk");
const {
  syncAndSeed,
  models: { Facility, Member, Booking, MemberBooking },
} = require("./db");

app.get("/api/facilities", async (req, res, next) => {
  try {
    res.send(
      await Facility.findAll({
        include: [
          {
            model: Booking,
          },
        ],
      })
    );
  } catch (err) {
    next(err);
  }
});

app.get("/api/bookings", async (req, res, next) => {
  try {
    res.send(
      await Booking.findAll({
        include: [
          {
            model: Facility,
            as: "facility",
          },
          {
            model: MemberBooking,
            as: "members",
          },
        ],
      })
    );
  } catch (err) {
    next(err);
  }
});

app.get("/api/members", async (req, res, next) => {
  try {
    res.send(
      await Member.findAll({
        include: [
          {
            model: Member,
            as: "sponsored",
          },
        ],
      })
    );
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  try {
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, () =>
      console.log(chalk.green(`listening on port ${port}`))
    );
  } catch (err) {
    console.log(chalk.red(err.stack));
  }
};

init();
