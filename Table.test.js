data.mapping = {
  id: "id",
  name: "name",
  age: "age",
  location: "address",
  position: "position",
  start_date: "start_date"
};
data.gridColumns = Object.keys(data.mapping);
data.cellStyleMapping = {
  id: "tc"
};
data.headingStyleMapping = {
  id: "tc",
  age: "tr"
};
for (let i = 0; i <= 1000; i++) {
  data.gridData.push({
    id: i,
    name: faker.name.findName(),
    age: faker.random.number({
      min: 18,
      max: 65
    }),
    address: faker.address.streetAddress(),
    position: faker.name.jobTitle(),
    start_date: faker.date.past()
  })
}