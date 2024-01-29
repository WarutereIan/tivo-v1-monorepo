import { RabbitMQ } from "../../config/rabbitmq/rabbitmq"
import { SSAction } from "../../models/SSActions";
import { Wallet } from "../../models/Wallet";

export const processSoftSwissBetActions = () => {
    const Consumer = RabbitMQ.createConsumer({
        queue: "sswissBetActions",
        queueOptions: { durable: true },
        qos: { prefetchCount: 2 },
        exchanges: [{ exchange: "sswissBetActions", type: "topic" }],
        queueBindings: [{
            exchange: "sswissBetActions",
            routingKey:"sswissBetActions"
        }]
    }, async (msg: any)=>{
        try {
            //body: msg.body
            console.log("sswiss queue",msg.body);
            

            const { user_id, action } = msg.body

            let userWallet: null | any = await Wallet.findOne({
                ownerID: user_id,
            })

            
                let action_type = action.action

                let _bet_action = await SSAction.create({
                  user_id,
                  action_type,
                  ...action,
                });

                userWallet.currentBalance = userWallet.currentBalance - _bet_action.amount/100;
                _bet_action.processed = true;
                let _date = new Date();
                _bet_action.processed_at = { time: _date.toISOString() };
                await userWallet.save();

                await _bet_action.save();
                  console.info(`processed bet action ${action.action_id} in queue
                    
                  `);
          

        }
        catch (err) {
            console.error(err)
        }
    })
    
    Consumer.on("ready", () => {
    console.info("sswissBetActions consumer ready");
  });
};
