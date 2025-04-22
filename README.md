# GarbNavigation

GarbNavigation is a project designed to provide efficient navigation and routing solutions.

## Features

- Easy-to-use navigation system.
- Optimized routing algorithms.
- Customizable settings.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/GarbNavigation.git
    ```
2. Navigate to the project directory:
    ```bash
    cd GarbNavigation
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## Usage

Run the application:
```bash
npx expo start
```
to run database 
```bash
cd server
node server
```

## Version 2 Needed data 
Copy paste this mongosh script

db.yourCollectionName.insertMany([
  {
    "_id": ObjectId("67cd858da5bf70264929bdaf"),
    "name": "Tambo Market",
    "latitude": 8.243782841245608,
    "longitude": 124.25941187970281,
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "non-iot"
  },
  {
    "_id": ObjectId("67cd858da5bf70264929bdb0"),
    "name": "Poblacion Market",
    "latitude": 8.229067756669375,
    "longitude": 124.23340316741492,
    "volume": 90,
    "status": "Active",
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "iot"
  },
  {
    "_id": ObjectId("67cd858da5bf70264929bdb1"),
    "name": "Poblacion",
    "latitude": 8.229658140575282,
    "longitude": 124.23514822203155,
    "volume": 90,
    "status": "Active",
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "iot"
  },
  {
    "_id": ObjectId("67cd858da5bf70264929bdb2"),
    "name": "Dr. Uy",
    "latitude": 8.22815019237838,
    "longitude": 124.24087734691295,
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "non-iot"
  },
  {
    "_id": ObjectId("67cd858da5bf70264929bdb3"),
    "name": "Sabayle",
    "latitude": 8.2312672214389,
    "longitude": 124.23625048155219,
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "non-iot"
  },
  {
    "_id": ObjectId("67cd858da5bf70264929bdb4"),
    "name": "Unitop",
    "latitude": 8.22907517762182,
    "longitude": 124.238429123881,
    "volume": 40,
    "status": "Inactive",
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "iot"
  },
  {
    "_id": ObjectId("67cd858da5bf70264929bdb5"),
    "name": "Elena Tower Inn",
    "latitude": 8.239300062360018,
    "longitude": 124.24411857785347,
    "volume": 90,
    "status": "Active",
    "timestamp": ISODate("2025-03-09T12:11:57.682Z"),
    "binType": "iot"
  },
  {
    "_id": ObjectId("6807150c8cfd39cd35fa9396"),
    "name": "Ubaldo Laya",
    "latitude": 8.225054,
    "longitude": 124.245147,
    "timestamp": ISODate("2025-04-22T08:45:00.000Z"),
    "binType": "non-iot"
  }
]);

for schedule

const shifts = ["First", "Second", "Third"];

db.locations.find({ binType: "iot" }).forEach(bin => {
  shifts.forEach(shift => {
    db.locationschedule.insertOne({
      locationId: bin._id, 
      day: "Tuesday",
      shift: shift,
      collection: "pending"
    });
  });
});