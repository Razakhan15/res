const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
dotenv.config({ path: "config.env" });
const port = process.env.PORT;
mongoose.connect(process.env.DB_URI).then((data) => {
  console.log(`mongodb connected with server:${data.connection.host}`);
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Model for dishes
const menuItemSchema = new mongoose.Schema({
  names: {
    type: String,
    required: [true, "Please Enter dish name"],
  },
  description: {
    type: String,
    required: [true, "Please Enter dish Description"],
  },
  price: {
    type: Number,
    required: [true],
  },
  category: {
    type: String,
    required: [true, "Whether Veg or Non-veg"],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  ingredients: {
    type: String,
    required: [true, "Please Enter ingredients of dish"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
});

//Model for cusinses
const cusinseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter cusinse name"],
  },
  dishes: [menuItemSchema],
});

//Model for restaurants
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter restaurant name"],
  },
  address: {
    type: String,
    required: [true, "Please Enter restaurant address"],
  },
  availableFood: {
    type: String,
    required: [true, "Whether Veg, Non-veg or both"],
  },
  description: {
    type: String,
    required: [true, "Please Enter restaurant Description"],
  },
  phone: {
    type: Number,
    required: [true, "Please Enter restaurant Price"],
    minLength: [10, "Price cannot be less than 10 characters"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  cusinse: [cusinseSchema],
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

//Adding new restaurant
app.post("/restaurants", async (req, res) => {
  try {
    const newRestaurant = await Restaurant.create(req.body);
    res.json(newRestaurant);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Adding cusines
app.post("/restaurants/:restaurantId/cusinses", async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    restaurant.cusinse.push(req.body);
    await restaurant.save();

    res.json(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//Adding dishes in cusines
app.post(
  "/restaurants/:restaurantId/cusinses/:cusinseId/dishes",
  async (req, res) => {
    const { restaurantId, cusinseId } = req.params;

    try {
      const restaurant = await Restaurant.findById(restaurantId);
      const cusinses = restaurant.cusinse.id(cusinseId);

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found." });
      }
      if (!cusinses) {
        return res.status(404).json({ error: "not found" });
      }

      cusinses.dishes.push(req.body);
      await restaurant.save();

      res.json(req.body);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

//Updating dishes
app.put(
  "/restaurants/:restaurantId/cusinses/:cusinseId/dishes/:dishId",
  async (req, res) => {
    const { restaurantId, cusinseId, dishId } = req.params;
    const { names, price } = req.body;

    try {
      const restaurant = await Restaurant.findById(restaurantId);
      const cusinses = restaurant.cusinse.id(cusinseId);
      const dish = cusinses.dishes.id(dishId);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found." });
      }
      if (!cusinses) {
        return res.status(404).json({ error: "not found" });
      }
      if (!dish) {
        return res.status(404).json({ error: "Dish not found." });
      }

      if (names) dish.names = names;
      if (price) dish.price = price;

      await restaurant.save();

      res.json(dish);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// Deleting a dish
app.delete(
  "/restaurants/:restaurantId/cusinses/:cusinseId/dishes/:dishId",
  async (req, res) => {
    const { restaurantId, cusinseId, dishId } = req.params;

    try {
      const restaurant = await Restaurant.findById(restaurantId);
      const cusinses = restaurant.cusinse.id(cusinseId);
      const dish = cusinses.dishes.id(dishId);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found." });
      }
      if (!cusinses) {
        return res.status(404).json({ error: "not found" });
      }
      if (!dish) {
        return res.status(404).json({ error: "Dish not found." });
      }

      dish.deleteOne();
      await restaurant.save();

      res.json({ message: "Dish deleted successfully." });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

//Updating cusinse
app.put("/restaurants/:restaurantId/cusinses/:cusinseId", async (req, res) => {
  const { restaurantId, cusinseId } = req.params;
  const { name } = req.body;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    const cusinses = restaurant.cusinse.id(cusinseId);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }
    if (!cusinses) {
      return res.status(404).json({ error: "not found" });
    }

    if (name) cusinses.name = name;
    console.log(name);

    await restaurant.save();

    res.json(cusinses);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Deleting cusinse
app.delete(
  "/restaurants/:restaurantId/cusinses/:cusinseId",
  async (req, res) => {
    const { restaurantId, cusinseId } = req.params;

    try {
      const restaurant = await Restaurant.findById(restaurantId);
      const cusinses = restaurant.cusinse.id(cusinseId);

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found." });
      }
      if (!cusinses) {
        return res.status(404).json({ error: "not found" });
      }

      cusinses.deleteOne();
      await restaurant.save();

      res.json({ message: "Dish cusinse successfully." });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

// Delete a restaurant
app.delete("/restaurants/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findByIdAndDelete(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    res.json({ message: "Restaurant deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error deleting restaurant." });
  }
});

app.listen(port, () => {
  console.log(`${port} running...`);
});
