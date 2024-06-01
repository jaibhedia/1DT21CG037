const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const BASE_URL = process.env.BASE_URL;

let accessToken = '';

const registerClient = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/companies/register`, {
            companyName: "DSATM",
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            ownerName: process.env.OWNER_NAME,
            ownerEmail: process.env.OWNER_EMAIL,
            rollNo: process.env.ROLL_NO
        });
        console.log('Client registered successfully.');
    } catch (error) {
        console.error('Error registering client:', error.message);
    }
};

const authenticateClient = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/companies/auth`, {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });
        accessToken = response.data.access_token;
        console.log('Client authenticated successfully.');
    } catch (error) {
        console.error('Error authenticating client:', error.message);
    }
};

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${accessToken}`
    }
});

app.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    const { top = 10, minPrice = 0, maxPrice = Infinity, page = 1, sort, order = 'asc' } = req.query;

    const companyNames = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
    let products = [];

    console.log(`Fetching products for category: ${categoryname}`);

    try {
        for (const company of companyNames) {
            const url = `${BASE_URL}/companies/${company}/categories/${categoryname}/products`;
            const params = { top, minPrice, maxPrice, page };
            console.log(`Requesting URL: ${url} with params: ${JSON.stringify(params)}`);
            const response = await axios.get(url, { params, ...getAuthHeader() });
            if (response.status === 200) {
                products = products.concat(response.data);
            }
        }

        if (sort) {
            const reverse = (order === 'desc');
            products.sort((a, b) => {
                if (reverse) {
                    return b[sort] - a[sort];
                } else {
                    return a[sort] - b[sort];
                }
            });
        }

        const start = (page - 1) * 10;
        const end = start + 10;
        const paginatedProducts = products.slice(start, end);

        paginatedProducts.forEach((product, idx) => {
            product.id = `${categoryname}_${idx + start + 1}`;
        });

        res.json(paginatedProducts);
    } catch (error) {
        console.error(`Error fetching products: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { categoryname, productid } = req.params;
    const companyNames = ["AMZ", "FLP", "SNP", "MYN", "AZO"];

    console.log(`Fetching product details for ID: ${productid} in category: ${categoryname}`);

    try {
        for (const company of companyNames) {
            const url = `${BASE_URL}/companies/${company}/categories/${categoryname}/products/${productid}`;
            console.log(`Requesting URL: ${url}`);
            const response = await axios.get(url, getAuthHeader());
            if (response.status === 200) {
                res.json(response.data);
                return;
            }
        }
        res.status(404).json({ error: 'Product not found' });
    } catch (error) {
        console.error(`Error fetching product details: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

const init = async () => {
    await registerClient();
    await authenticateClient();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use.`);
        } else {
            console.error(`Server error: ${err}`);
        }
    });
};

init();
