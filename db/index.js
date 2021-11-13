const Sequelize = require("sequelize");
const { STRING, UUID, UUIDV4, DATE } = Sequelize;
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_country_club"
);

const Facility = conn.define("facility", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  fac_name: {
    type: STRING,
    allowNull: false,
    unique: true,
  },
});

const Member = conn.define("member", {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  first_name: {
    type: STRING,
    allowNull: false,
    unique: true,
  },
});

Member.belongsTo(Member, { as: "sponsor" });
Member.hasMany(Member, { foreignKey: "sponsorId", as: "sponsored" });

const Booking = conn.define("booking", {
  startTime: {
    type: DATE,
    allowNull: false,
  },
  endTime: {
    type: DATE,
    allowNull: false,
  },
});

Booking.belongsTo(Facility);
Facility.hasMany(Booking);

const MemberBooking = conn.define("member_booking", {});

MemberBooking.belongsTo(Member);
Member.hasMany(MemberBooking);
MemberBooking.belongsTo(Booking);
Booking.hasMany(MemberBooking, { as: "members" });

const syncAndSeed = async () => {
  try {
    await conn.sync({ force: true });
    const [moe, lucy, larry, ethyl] = await Promise.all(
      ["moe", "lucy", "larry", "ethyl"].map((first_name) =>
        Member.create({ first_name })
      )
    );
    const [tennis, ping_pong, raquet_ball, bowling] = await Promise.all(
      ["tennis", "ping-pong", "raquet-ball", "bowling"].map((fac_name) =>
        Facility.create({ fac_name })
      )
    );
    //new Date(year, monthIndex, day, hours, minutes)
    const [book1, book2, mb1, mb2, mb3] = await Promise.all([
      Booking.create({
        facilityId: tennis.id,
        startTime: new Date("2021-12-17T16:24:00"),
        endTime: new Date("1995-12-17T17:24:00"),
      }),
      Booking.create({
        facilityId: ping_pong.id,
        startTime: new Date("2020-01-10T11:30:00"),
        endTime: new Date("2020-01-10T13:30:00"),
      }),
      MemberBooking.create({}),
      MemberBooking.create({}),
      MemberBooking.create({}),
    ]);
    await Promise.all([
      larry.update({ sponsorId: lucy.id }),
      moe.update({ sponsorId: lucy.id }),
      ethyl.update({ sponsorId: moe.id }),
      mb1.update({ memberId: lucy.id }),
      mb2.update({ memberId: moe.id }),
      mb3.update({ memberId: lucy.id }),
      mb1.update({ bookingId: book1.id }),
      mb2.update({ bookingId: book1.id }),
      mb3.update({ bookingId: book2.id }),
    ]);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  conn,
  syncAndSeed,
  models: { Facility, Member, Booking, MemberBooking },
};
