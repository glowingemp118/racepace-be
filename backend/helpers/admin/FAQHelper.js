const User = require('../../schemas/User');
const FAQS = require('../../schemas/FAQ');
const mongoose = require('mongoose');


const getFAQS = async (pageno) => {
    const limit = parseInt(process.env.ITEMPERPAGE)|| 10;
    const skip = (pageno - 1) * limit
    const faqs = await FAQS.aggregate([
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $facet: {
                metadata: [
                    {
                        $count: "total",
                    },
                ],
                data: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ],
            },
        },
    ]);

    if (!faqs[0].metadata[0])  {
        return {
            total_length: 0,
            faqs: [],
        };
     } else {
        const total_pages = Math.ceil(
            faqs[0].metadata[0].total / limit
        );
        const total_length = faqs[0].metadata[0].total
        return {
            total_length,
            total_pages: total_pages,
            faqs: faqs[0].data,
        };
    }
}


const getFAQ = async (faq_id) => {
    const faq = await FAQS.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(faq_id)
            }
        }
    ]);
    if (!faq) {
        throw new Error('Invalid faq_id');
    }
    return faq[0];
}


module.exports = { getFAQS, getFAQ }