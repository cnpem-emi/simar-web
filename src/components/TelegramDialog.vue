<template>
  <v-dialog v-model="dialog" max-width="700px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-on="on" v-bind="attrs" depressed dark color="blue">
        Link Telegram</v-btn
      >
    </template>
    <v-card>
      <v-card-title> Link Telegram account </v-card-title>
      <v-card-text>
        If you wish to receive notifications through Telegram as well, link your
        telegram account by following the steps below:
      </v-card-text>
      <v-stepper v-model="e1">
        <v-stepper-header>
          <v-stepper-step :complete="e1 > 1" step="1">
            Message the Bot
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="e1 > 2" step="2">
            Inform your ID
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step step="3"> Confirm </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card flat>
              <v-card-text>
                Send /start to
                <a href="https://t.me/ControlsGroupInfoBot"
                  >@ControlsGroupInfoBot</a
                >. The bot will respond with further instructions on registering
                yourself if you want to use other commands. If not, proceed to
                the next step with your ID.
              </v-card-text>
              <v-card-text>
                If you're already registered with
                <a href="https://t.me/ControlsGroupInfoBot"
                  >@ControlsGroupInfoBot</a
                >, then use /checkme to obtain your user ID.
              </v-card-text>
            </v-card>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="e1 = 2"> Continue </v-btn>

              <v-btn text @click="dialog = false"> Cancel </v-btn>
            </v-card-actions>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card flat>
              <v-card-text> Inform the user ID given by the bot: </v-card-text>
              <v-text-field
                v-model="id"
                clearable
                outlined
                hint="Telegram User ID"
              />
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="register" :disabled="!can_move">
                  Continue
                </v-btn>
                <v-btn text @click="e1 = 1"> Back </v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card flat>
              <v-card-text>
                You should receive the following message confirming that you're
                correctly registered:
              </v-card-text>
              <v-card-text>
                <i
                  >Hello,
                  <b>{{ this.$store.state.account.name.split(" ")[0] }}</b
                  >! If you've received this message, then you've configured
                  SIMAR's EPICSTEL integration correctly. For more information
                  on how to use this bot, check out /help.</i
                >
              </v-card-text>
              <v-card-text>
                If not, confirm that your ID is correct by going back to the
                previous step. If you did receive the message, then you're
                finished!
              </v-card-text>
            </v-card>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="dialog = false"> Finish </v-btn>

              <v-btn text @click="e1 = 2"> Back </v-btn>
            </v-card-actions>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function () {
    return {
      dialog: false,
      can_move: true,
      e1: 1,
      id: "",
    };
  },
  methods: {
    async register() {
      this.can_move = false;
      const response = await this.send_command(`telegram/${this.id}`, "POST");
      if (response.status !== 200) {
        this.$store.commit("showSnackbar", `Invalid Telegram ID!`);
        this.id = "";
      } else {
        this.e1 = 3;
      }
      this.can_move = true;
    },
  },
};
</script>
