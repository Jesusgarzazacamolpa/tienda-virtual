export const typeDefs = /* GraphQL */ `
  enum Category {
    AUDIO
    CALZADO
    ACCESORIOS
    HOGAR
  }

  enum OrderStatus {
    PENDING
    PAID
    SHIPPED
    DELIVERED
    CANCELLED
  }

  enum PaymentMethod {
    CARD
    TRANSFER
  }

  type Color {
    name: String!
    hex: String!
  }

  type Product {
    id: ID!
    slug: String!
    name: String!
    category: Category!
    price: Float!
    compareAtPrice: Float
    stock: Int!
    badge: String
    tagline: String!
    description: String!
    image: String!
    colors: [Color!]!
    active: Boolean!
    createdAt: String!
  }

  type OrderLine {
    productId: ID!
    name: String!
    color: String!
    quantity: Int!
    unitPrice: Float!
  }

  type OrderCustomer {
    fullName: String!
    email: String!
    phone: String!
    address: String!
    city: String!
    state: String!
    postalCode: String!
  }

  type Order {
    id: ID!
    createdAt: String!
    estimatedDelivery: String!
    customer: OrderCustomer!
    paymentMethod: PaymentMethod!
    status: OrderStatus!
    lines: [OrderLine!]!
    subtotal: Float!
    shipping: Float!
    total: Float!
  }

  input ColorInput {
    name: String!
    hex: String!
  }

  input ProductInput {
    name: String!
    category: Category!
    price: Float!
    compareAtPrice: Float
    stock: Int!
    badge: String
    tagline: String!
    description: String!
    image: String!
    colors: [ColorInput!]!
    active: Boolean! = true
  }

  type Query {
    products(search: String, category: Category, active: Boolean): [Product!]!
    product(id: ID!): Product
    orders(status: OrderStatus): [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
  }
`;
